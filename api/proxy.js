export default async function handler(req,res){
    try{
        const response = await fetch('https://result.election.gov.np/JSONFiles/ElectionResultCentral2082.txt');
        const data = await response.json();
        res.status(200).json(data);
    }catch(err){
        res.status(500).json({ error:'Failed to fetch data' });
    }
}
