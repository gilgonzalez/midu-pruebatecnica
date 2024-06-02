import { useState } from 'react';
import './App.css'
import { uploadFile } from './services/upload';
import {Toaster, toast} from 'sonner';
import { Data } from './types';
import Search from './steps/Search';

const APP_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error',
  READY_USAGE : 'ready_usage',
  READY_UPLOAD : 'ready_upload'
} as const

const BUTTON_TEXT = {
  [APP_STATUS.LOADING]: 'Subiendo...',
  [APP_STATUS.READY_UPLOAD]: 'Subir CSV'
}

type AppStatusType = typeof APP_STATUS[keyof typeof APP_STATUS]

function App() {

  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE)
  const [file, setFile] = useState<File | null>(null)
  const [data, setData] = useState<Data >([])
  const showButton = appStatus === APP_STATUS.READY_UPLOAD || appStatus === APP_STATUS.LOADING
  const showInput = appStatus !== APP_STATUS.READY_USAGE

  //* FUNCTIONS
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [file] = event.target.files ?? []
    if (file) {
      setFile(file)
      setAppStatus(APP_STATUS.READY_UPLOAD)
    }
  }
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if(appStatus !== APP_STATUS.READY_UPLOAD || !file) return 
    setAppStatus(APP_STATUS.LOADING)

    const [err, newData] = await uploadFile(file)

    //? HAY UN ERROR Y SE MUESTRA EL TOAST
    if(err) {
      setAppStatus(APP_STATUS.ERROR)
      toast.error(err.message)
      return
    }

    //? EL COMPONENTE ESTA LISTO PARA UTILIZARSE
    setAppStatus(APP_STATUS.READY_USAGE)
    console.log({newData})
    if(newData) setData(newData)
    toast.success('CSV subido correctamente')
  }
  

  return (
    <div >
    <Toaster/>
        <h4>Upload CSV AND SEARCH</h4>
        <div>
          {
            showInput && (

            <form onSubmit={handleSubmit}>
              <label htmlFor="">
                <input 
                  disabled={APP_STATUS.LOADING === appStatus}
                  type="file" 
                  onChange={handleInputChange} 
                  accept=".csv"
                  name="file"
                />
              </label>
              {
                showButton && (
                  <button disabled = {APP_STATUS.LOADING === appStatus}>
                    {BUTTON_TEXT[appStatus]}
                  </button>
                )
              }
            </form>
            )
          }
        </div>
        {
          appStatus === APP_STATUS.READY_USAGE && (
            <div>
              <h4>Data</h4>
              <Search initialData={data}/>
            </div>
          )
        }
    </div>
  )
}

export default App
