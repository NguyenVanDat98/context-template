/* eslint-disable @typescript-eslint/no-explicit-any */
import { defaultTo, get } from "lodash";
import React, { createContext, useContext, useReducer, ReactNode, useCallback } from "react";

interface Action<T> {
  type: "UPDATE"|"SEARCH_REQUEST"|"SEARCH_END"|"SEARCH_FAIL";
  field: T;
  payload?: any;
}

type CreateContextProvider<T extends object> = {
  Provider: React.FC<{
    children: ReactNode;
    value?: {
      [k in keyof T]: T[k];
    };
  }>;
  useGetState: <R extends keyof T>(
    key: R
  ) => [T[R], (dat:  T[R] | never  ) => any, boolean, (...rest:any[])=>void];
  Consumer: React.Consumer<{
    state: T;
    dispatch: React.Dispatch<Action<keyof T>>;
  }>;
};

const createContextProvider = <T extends object>(
  init: T
): CreateContextProvider<T> => {
  type State = typeof init;
  type KeyState = keyof State;
  type RootType = CreateContextProvider<State>;

  const MyContext = createContext<{
    state: State;
    dispatch: React.Dispatch<Action<KeyState >>;
  }>({ state: init, dispatch: () => {} });

  const reducer = (
    state: { [k in KeyState]: State[k] },
    action: Action<KeyState>
  ): State => {
    switch (action.type) {
      case "UPDATE":
        return { ...state, ['loading_'+ action.field.toString()]: false, [action.field]: action.payload };
      case "SEARCH_REQUEST":
        return { ...state, ['loading_'+ action.field.toString()]: true };
      case "SEARCH_END":
        return { ...state, ['loading_'+ action.field.toString()]: false, [action.field]: action.payload };
      case "SEARCH_FAIL":
        return { ...state, ['loading_'+ action.field.toString()]: false };
      default:
        return { ...state };
    }
  };

  const Provider: RootType["Provider"] = ({ children, value }) => {
    const [state, dispatch] = useReducer(reducer, { ...init, ...defaultTo(value,{}) });
    return (
      <MyContext.Provider value={{ state, dispatch }}>
        {children}
      </MyContext.Provider>
    );
  };

  const Consumer = MyContext.Consumer;

  const useGetState: RootType["useGetState"] = (field) => {
    const context = useContext(MyContext);
    if (!context) {
      throw new Error("useGetState must be used within a Provider");
    }
    const { state, dispatch } = context;
    const setState :ReturnType<RootType["useGetState"]>[1] = (payload) => {
      dispatch({ type: "UPDATE", field, payload });
    };
    const onSearch = useCallback(async(call:(...rest:any[])=>Promise<any>, ...params: (string|{[field:string]: string})[]):Promise<void>=>{
      try {
        dispatch({ type: "SEARCH_REQUEST", field })
        call(...params).then((data)=>{
          dispatch({ type: "SEARCH_END", field, payload:data})
        }).catch((e)=> {
          throw new Error(e)
        });
      } catch (error) {
        dispatch({ type: "SEARCH_FAIL", field})
        console.error('error onSearch',error)
      }
    },[])
    return [ state[field], setState, Boolean(get(state,['loading_'+String(field)])), onSearch ];
  };
  return {
    Provider,
    useGetState,
    Consumer,
  };
};

export default createContextProvider;
