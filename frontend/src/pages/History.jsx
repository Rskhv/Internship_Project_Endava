import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {api} from '../services/api';
import {Navbar,Loading,Empty,Alert,Button} from '../components/Ui';
export default function HistoryPage(){
 const profileId=localStorage.getItem('streamify.profile');const [rows,setRows]=useState([]);const [error,setError]=useState('');const [busy,setBusy]=useState(true);
 useEffect(()=>{if(profileId)api.history(profileId).then(setRows).catch(e=>setError(e.message)).finally(()=>setBusy(false));else setBusy(false);},[profileId]);
 async function remove(id){try{await api.removeHistory(profileId,id);setRows(rows.filter(x=>String(x.content_id)!==String(id)));}catch(e){setError(e.message);}}
 return <><Navbar active="History"/><main className="page-wrap"><p className="eyebrow">YOUR ACTIVITY</p><h1>Watch history</h1><p className="muted">Your recent progress for this profile.</p><Alert>{error}</Alert>{busy?<Loading/>:!rows.length?<Empty title="Your history is clear">Start a simulated playback session to see it here.</Empty>:<div className="history-list">{rows.map(item=><article className="history-item" key={item.id}><div className="history-art">▶</div><div className="history-copy"><strong>{item.title}</strong><small>{item.content_type==='tv_show'?'Series':'Movie'} · {new Date(item.last_watched_at).toLocaleDateString()}</small><div className="progress-track"><span style={{width:`${item.progress_percentage}%`}}/></div><small>{item.completed?'Completed':`${Math.round(item.progress_percentage)}% watched`}</small></div><div className="history-actions"><Link className="button primary" to={`/watch/${item.content_id}`}>{item.completed?'Watch again':'Resume'}</Link><Button kind="ghost" onClick={()=>remove(item.content_id)}>Remove</Button></div></article>)}</div>}</main></>;
}
