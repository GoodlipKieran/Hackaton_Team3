import { createRoot } from 'react-dom/client'
import './index.css'
import CheckAuth from './auth/CheckAuth'

createRoot(document.getElementById('root')).render(
		<div
			className={
				'fixed top-0 left-0 h-screen w-screen overflow-hidden flex flex-col'
			}
		>
			<CheckAuth/>
		</div>
)
