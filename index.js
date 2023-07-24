const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aws78to.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const collegeCollection = client.db('CollegeDB').collection('colleges')
        const admissionCollection = client.db('CollegeDB').collection('admissions')
       
        app.get('/colleges', async(req, res) => {
            const result = await collegeCollection.find().toArray();
            res.send(result);
        })
        
        app.get('/colleges/:id', async(req, res) => {
            const id = req.params.id;
            const query = {_id: new ObjectId(id)};
            const result = await collegeCollection.findOne(query);
            res.send(result);
        })

        app.get('/admission', async(req, res) => {
            const colleges = await collegeCollection.find().toArray();
            
            const result = colleges.map(college => {
                const admission = {
                    collegeId: college._id,
                    collegeName: college.college_name,
                    collegeImage: college.college_image,
                    AdmissionDate: college.admission_dates
                }
                return admission
            })
            res.send(result)
        })


        app.get('/college', async(req, res) => {
            const search = req.query.search;
    
            const query = {college_name: {$regex: search, $options: 'i'}}

            const result = await collegeCollection.findOne(query);
            res.send(result);
        })

        // admissionCollection operation start here
        app.post('/admission', async(req, res) => {
            const StudentData = req.body;
            const result = await admissionCollection.insertOne(StudentData);
            res.send(result)
        })

        app.get('/my-college/:email', async(req, res) => {
            const email = req.params.email;
            const query = {email: email}
            const studentData = await admissionCollection.find(query).toArray();
            const collegeId = studentData.map(data => data.collegeId);

            // const query2 = {_id: new ObjectId(collegeId.map(id => id))}
            const query2 = { _id: { $in: collegeId.map(id => new ObjectId(id)) } }
            const result = await collegeCollection.find(query2).toArray();

            res.send(result)
        })


        console.log("You successfully connected to MongoDB!");
    } finally {
        // await client.close();
    }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('collegeFacilitySnap server is running')
})
app.listen(port, () => {
    console.log(`collegeFacilitySnap server is running ${port}`)
});