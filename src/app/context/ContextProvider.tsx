import React, { ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { Member } from "../../lib/types/member";
import { serverApi } from "../../lib/config";
import  { GlobalContext } from "../hooks/useGlobals";

const readStoredMember = (): Member | null => {
  try {
    const raw = localStorage.getItem("memberData");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const ContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ authMember, setAuthMember ]  = useState<Member | null>(readStoredMember);

  const [ orderBuilder, setOrderBuilder ]= useState<Date>(new Date());

  // Any 401 from the API means the cookie expired: drop the stale local session
  useEffect(() => {
    const id = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const url: string = error?.config?.url || "";
        if (error?.response?.status === 401 && !url.endsWith("/member/login")) {
          localStorage.removeItem("memberData");
          setAuthMember(null);
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(id);
  }, []);

  // On startup verify that the stored session is still valid on the server
  useEffect(() => {
    if (!readStoredMember()) return;
    axios
      .get(`${serverApi}/member/detail`, { withCredentials: true })
      .then((res) => {
        localStorage.setItem("memberData", JSON.stringify(res.data));
        setAuthMember(res.data);
      })
      .catch((err) => {
        // 401 is handled by the interceptor; 404 means blocked/deleted account
        if (err?.response?.status === 404) {
          localStorage.removeItem("memberData");
          setAuthMember(null);
        }
      });
  }, []);

 return (
 <GlobalContext.Provider
  value={{ authMember, setAuthMember, orderBuilder, setOrderBuilder }}
  >
   { children }
 </GlobalContext.Provider>
 );
};

export default ContextProvider;
