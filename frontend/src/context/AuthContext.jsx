import {createContext,useContext,useEffect,useMemo,useState} from 'react';
import {api} from '../services/api';
const AuthContext=createContext(null);
export function AuthProvider({children}){
  const [user,setUser]=useState(null);const [ready,setReady]=useState(false);
  useEffect(()=>{api.me().then(({user:value})=>setUser(value)).catch(()=>setUser(null)).finally(()=>setReady(true));},[]);
  const value=useMemo(()=>({user,ready,login:async(data)=>{const result=await api.login(data);localStorage.removeItem('streamify.profile');setUser(result.user);return result.user;},register:async(data)=>{const result=await api.register(data);localStorage.removeItem('streamify.profile');setUser(result.user);return result.user;},logout:async()=>{await api.logout();setUser(null);localStorage.removeItem('streamify.profile');}}),[user,ready]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth=()=>useContext(AuthContext);
