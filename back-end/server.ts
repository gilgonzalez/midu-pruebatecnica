import express from 'express';
import cors from 'cors';
import multer from 'multer';
import  csvToJson from 'convert-csv-to-json';

const app = express();

const port = process.env.PORT ?? 3000

const storage = multer.memoryStorage();
const upload = multer({ storage });

let userData : Array<Record<string,string>> = []

app.use(cors()); // enable CORS for all routes

//Creando los endpoints
app.post('/api/files', upload.single("file"),  async (req, res) => {
  // 1 Extraer el archivo
  const { file } = req;
  // 2 Validar que tenemos el archivo
  if(!file) return res.status(500).json({message:"Archivo es necesario"})
  // 3 Validar el mimetype
  if(file.mimetype !== "text/csv") return res.status(500).json({message:"Archivo debe ser CSV"})
  // 4 Transformar el File (Buffer) a string

  let json: Array<Record<string,string>> = []
  try{
    const rowCsv = Buffer.from(file.buffer).toString('utf-8')
    console.log({rowCsv})
    // 5 Transformar el string a csv
    json = csvToJson.fieldDelimiter(',').csvStringToJson(rowCsv)
    
  } catch(err){
    return res.status(500).json({message:"Error al transformar el archivo"})
  }
  // 6 Guardar el JSON a memoria
  userData = json 

  // 7 Devolver 200 con mensaje y el json guardado

  return res.status(200).json({data:json, message:"Archivo cargado correctamente"})
})

app.get("/api/users", async (req, res)=> {
  // 1 Extraer query param 'q' de la req
  const { q } = req.query;
  // 2 Validar que el query param 'q' no este vacio
  if(!q) return res.status(500).json({message:"Query param 'q' es necesario"})
    console.log({q})
  if (Array.isArray(q)) return res.status(500).json({message:"Query param 'q' debe ser un string"}) 
  // 3 Filtrar los datos de bd con el query param 'q'
  const search = q.toString().toLowerCase()

  const filteredData = userData.filter((row)=> {
    return Object
      .values(row)
      .some(value => value?.toLowerCase().includes(search))
  })
  // 4 Devolver 200 con los datos filtrados
  return res.status(200).json({data:filteredData})
})


app.listen(port, ()=> {
  console.log('servidor corriendo', port)
})