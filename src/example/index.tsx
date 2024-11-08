/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-object-type */
import React, { useEffect } from "react";
import createContextProvider from "../hook";
type propsType = {};

type User = {
  name: string;
  age: number;
};
const init = {
  users: [] as User[],
};
type InitType = typeof init & {
  users: User[];
};
const { Provider, Consumer, useGetState } =
  createContextProvider<InitType>(init);

const useGetUserById = () => {};

export default function App(props: propsType): React.JSX.Element {
    const [users, handleUpdateUser, userLoading, onSearchUser ] = useGetState("users");

  useEffect(() => {
    const fetchFirstTime = new Promise<User[]>((resolve) =>
      setTimeout(() => {
        resolve([
          { name: "Anthony", age: 24 },
          { name: "Dean Evans", age: 25 },
        ]);
      }, 2000)
    );
    fetchFirstTime.then((res) => handleUpdateUser(res));
  }, []);

  return (
    <Provider>
        {
            users.map((user)=><Component name={user.name} age={user.age}/>)
        }
    </Provider>
  );
}

const Component = (props:User)=>{
    return <div> name: {props.name} , age : {props.age}</div>
}
