import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { searchData } from '../services/search';
import { Data } from '../types';
import { useDebounce } from "@uidotdev/usehooks";

const DEBOUNCE_TIME = 500



const Search = ({initialData}: {initialData : Data}) => {
  const [data, setData] = useState<Data>(initialData)
  const [search, setSearch] = useState<string>(()=>{
    const searchParams = new URLSearchParams(window.location.search)
    return searchParams.get('q') || ''
  })
  const debouncedSearchTerm = useDebounce(search, DEBOUNCE_TIME);

  const handleSearch = (event : React.ChangeEvent<HTMLInputElement>)=>{
    setSearch(event.target.value)
  }

  useEffect(()=> {
    const newPathName = debouncedSearchTerm === '' 
      ? window.location.pathname
      : `?q=${debouncedSearchTerm}`
    window.history.replaceState({}, '', newPathName)
  }
  ,[debouncedSearchTerm])

  

  useEffect(()=> {
    if(debouncedSearchTerm === '') {
      setData(initialData)
      return
    }
    //Filtrar los resultados del csv
    searchData(debouncedSearchTerm)
      .then(response => {
        const [err, newData] = response

        if(err){
          toast.error(err.message)
          return
        }
        if(newData) setData(newData)
      })

  }, [debouncedSearchTerm, initialData])
  return (
    <div>
      <form action="">
        <input type="search" placeholder='Buscar...' onChange={handleSearch} value={search}/>
      </form>
      <ul>
        {
          data.map((row, index)=> (
              <article key={index}>
                <li>
                  {
                    Object
                    .entries(row)
                    .map(([key, value]) => (
                      <p key={key}>
                        <strong>{key} : </strong> {value}
                      </p>
                    ))
                  }
                </li>
              </article>
          ))
        }
      </ul>
    </div>
  )
}

export default Search
