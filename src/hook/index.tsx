/* eslint-disable @typescript-eslint/no-explicit-any */
import { defaultTo } from "lodash";
import React, { createContext, useContext, useReducer, ReactNode, useState } from "react";

interface Action<T> {
  type: "UPDATE";
  key: T;
  payload: any;
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
    dispatch: React.Dispatch<Action<KeyState>>;
  }>({ state: init, dispatch: () => {} });

  const reducer = (
    state: { [k in KeyState]: State[k] },
    action: Action<KeyState>
  ): State => {
    switch (action.type) {
      case "UPDATE":
        return { ...state, [action.key]: action.payload };
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

  const useGetState: RootType["useGetState"] = (key) => {
    const context = useContext(MyContext);
    const [loading,setLoading] =useState(false)
    if (!context) {
      throw new Error("useGetState must be used within a Provider");
    }
    const { state, dispatch } = context;
    const setState :ReturnType<RootType["useGetState"]>[1] = (payload) => {
      dispatch({ type: "UPDATE", key, payload });
    };
    const onSearch = async(call:(...rest:any[])=>Promise<any>, ...params: (string|{[key:string]: string})[]):Promise<void>=>{
      try {
        setLoading(true)
        call(...params).then((data)=>{
          dispatch({ type: "UPDATE", key, payload:data})
          setLoading(false)
        });
      } catch (error) {
        setLoading(false)
        console.error('error onSearch',error)
      }
    }
    return [ state[key], setState, loading, onSearch ];
  };
  return {
    Provider,
    useGetState,
    Consumer,
  };
};

export default createContextProvider;
