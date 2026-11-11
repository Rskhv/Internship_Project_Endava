import {BrowserRouter,Navigate,Route,Routes} from 'react-router-dom';
import {AuthProvider,useAuth} from './context/AuthContext';
import {Loading} from './components/Ui';
import {LoginPage,RegisterPage,PlansPage,PaymentPage} from './pages/Auth';
import ProfilesPage from './pages/Profiles';
import HomePage from './pages/Home';
import HistoryPage from './pages/History';
import PlayerPage from './pages/Player';
import AdminPage from './pages/Admin';

function Guard({children,admin=false}){
 const {user,ready}=useAuth();if(!ready)return <Loading label="Opening Streamify…"/>;if(!user)return <Navigate to="/login" replace/>;if(admin&&user.role!=='admin')return <Navigate to="/home" replace/>;return children;
}
function AppRoutes(){return <Routes><Route path="/" element={<Navigate to="/home" replace/>}/><Route path="/login" element={<LoginPage/>}/><Route path="/register" element={<RegisterPage/>}/><Route path="/plans" element={<PlansPage/>}/><Route path="/payment" element={<Guard><PaymentPage/></Guard>}/><Route path="/subscriptions" element={<Guard><PaymentPage/></Guard>}/><Route path="/profiles" element={<Guard><ProfilesPage/></Guard>}/><Route path="/home" element={<Guard><HomePage/></Guard>}/><Route path="/history" element={<Guard><HistoryPage/></Guard>}/><Route path="/watch/:contentId" element={<Guard><PlayerPage/></Guard>}/><Route path="/admin" element={<Guard admin><AdminPage/></Guard>}/><Route path="*" element={<Navigate to="/home" replace/>}/></Routes>;}
export default function App(){return <AuthProvider><BrowserRouter><AppRoutes/></BrowserRouter></AuthProvider>;}
