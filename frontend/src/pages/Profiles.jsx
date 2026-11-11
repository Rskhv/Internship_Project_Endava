import {useEffect,useState} from 'react';
import {Link,useNavigate} from 'react-router-dom';
import {api} from '../services/api';
import {useAuth} from '../context/AuthContext';
import {Alert,Loading,Navbar,Button,Empty} from '../components/Ui';

export default function ProfilesPage(){
 const {user}=useAuth();const [profiles,setProfiles]=useState([]);const [error,setError]=useState('');const [name,setName]=useState('');const [maturity,setMaturity]=useState('adult');const [saving,setSaving]=useState(false);const [loading,setLoading]=useState(true);const nav=useNavigate();
 useEffect(()=>{api.profiles().then(setProfiles).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
 async function addProfile(e){e.preventDefault();setSaving(true);setError('');try{const profile=await api.createProfile({name,maturityRating:maturity});setProfiles([...profiles,profile]);setName('');}catch(e){setError(e.message);}finally{setSaving(false);}}
 async function choose(profile){try{await api.selectProfile(profile.id);localStorage.setItem('streamify.profile',profile.id);nav('/home');}catch(e){setError(e.message);}}
 return <><Navbar/><main className="page-wrap profiles-page"><p className="eyebrow">WHO’S WATCHING?</p><h1>Choose a profile</h1><p className="muted">Each profile keeps its own simulated watch history.</p><Alert>{error}</Alert>{loading?<Loading label="Loading profiles…"/>:profiles.length?<div className="profile-grid">{profiles.map((profile,i)=><button className="profile-card" key={profile.id} onClick={()=>choose(profile)}><span className={`avatar avatar-${i%5}`}>{profile.name.slice(0,1).toUpperCase()}</span><strong>{profile.name}</strong><small>{profile.maturity_rating} profile</small></button>)}</div>:<Empty title="Create your first profile">Set up a profile to begin exploring the demo catalog.</Empty>}<form className="inline-create" onSubmit={addProfile}><h2>Add profile</h2><div className="inline-fields"><input value={name} maxLength="60" required placeholder="Profile name" onChange={e=>setName(e.target.value)}/><select className="select" value={maturity} onChange={e=>setMaturity(e.target.value)}><option value="adult">Adult</option><option value="teen">Teen</option><option value="kids">Kids</option></select><Button disabled={saving}>{saving?'Adding…':'Add profile'}</Button></div></form><div className="page-actions"><Link className="text-link" to="/subscriptions">Manage demo subscription</Link>{user?.role==='admin'&&<Link className="text-link" to="/admin">Open admin dashboard</Link>}</div></main></>;
}
