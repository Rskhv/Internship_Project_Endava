const API='/api/v1';
export async function request(path,options={}){
  const response=await fetch(`${API}${path}`,{credentials:'include',...options,headers:{'Content-Type':'application/json',...(options.headers||{})}});
  if(response.status===204)return null;
  const body=await response.json().catch(()=>({}));
  if(!response.ok){const error=new Error(body.error?.message||'Request failed. Please try again.');error.status=response.status;throw error;}
  return body.data;
}
export const api={
  me:()=>request('/auth/me'),login:(data)=>request('/auth/login',{method:'POST',body:JSON.stringify(data)}),register:(data)=>request('/auth/register',{method:'POST',body:JSON.stringify(data)}),logout:()=>request('/auth/logout',{method:'POST'}),
  profiles:()=>request('/profiles'),selectProfile:(id)=>request(`/profiles/${id}/select`,{method:'POST'}),createProfile:(data)=>request('/profiles',{method:'POST',body:JSON.stringify(data)}),editProfile:(id,data)=>request(`/profiles/${id}`,{method:'PATCH',body:JSON.stringify(data)}),deleteProfile:(id)=>request(`/profiles/${id}`,{method:'DELETE'}),
  catalog:(params={})=>request(`/catalog?${new URLSearchParams(params)}`),genres:()=>request('/catalog/genres'),content:(id)=>request(`/catalog/${id}`),featured:()=>request('/catalog/featured/one'),
  history:(id)=>request(`/history/${id}`),continueWatching:(id)=>request(`/history/${id}/continue`),saveProgress:(profileId,contentId,progressPercentage)=>request(`/history/${profileId}/${contentId}/progress`,{method:'PUT',body:JSON.stringify({progressPercentage})}),removeHistory:(profileId,contentId)=>request(`/history/${profileId}/${contentId}`,{method:'DELETE'}),
  plans:()=>request('/subscriptions/plans'),currentSubscription:()=>request('/subscriptions/current'),payments:()=>request('/subscriptions/payments'),checkout:(planId,outcome,paymentMethodLabel)=>request('/subscriptions/demo-checkout',{method:'POST',body:JSON.stringify({planId,outcome,paymentMethodLabel})}),
  adminContent:(params={})=>request(`/catalog/admin/all?${new URLSearchParams(params)}`),adminContentItem:(id)=>request(`/catalog/admin/${id}`),createContent:(data)=>request('/catalog/admin',{method:'POST',body:JSON.stringify(data)}),updateContent:(id,data)=>request(`/catalog/admin/${id}`,{method:'PATCH',body:JSON.stringify(data)}),deleteContent:(id)=>request(`/catalog/admin/${id}`,{method:'DELETE'}),adminUsers:()=>request('/subscriptions/admin/users'),adminSubscriptions:()=>request('/subscriptions/admin/subscriptions'),adminPayments:()=>request('/subscriptions/admin/payments')
  ,addGenre:(name)=>request('/catalog/admin/genres',{method:'POST',body:JSON.stringify({name})}),editGenre:(id,name)=>request(`/catalog/admin/genres/${id}`,{method:'PATCH',body:JSON.stringify({name})}),deleteGenre:(id)=>request(`/catalog/admin/genres/${id}`,{method:'DELETE'}),addEpisode:(id,data)=>request(`/catalog/admin/${id}/episodes`,{method:'POST',body:JSON.stringify(data)}),deleteEpisode:(id)=>request(`/catalog/admin/episodes/${id}`,{method:'DELETE'})
};
