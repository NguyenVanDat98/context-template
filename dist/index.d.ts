import React, { ReactNode } from 'react';

interface Action<T> {
    type: "UPDATE" | "SEARCH_REQUEST" | "SEARCH_END" | "SEARCH_FAIL";
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
    useGetState: <R extends keyof T>(key: R) => [T[R], (dat: T[R] | never) => any, boolean, (...rest: any[]) => void];
    Consumer: React.Consumer<{
        state: T;
        dispatch: React.Dispatch<Action<keyof T>>;
    }>;
};
declare const createContextProvider: <T extends object>(init: T) => CreateContextProvider<T>;

export { createContextProvider as default };
