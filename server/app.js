const express = require('express')
const cors = require('cors')
const admin = require("firebase-admin");

const app = express();
app.use(cors('*'));
app.use(express.json())

let serviceAccount = require("./firebase/family-members-90397-firebase-adminsdk-67s3v-25027721b8.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

app.get('/members', async (_, res) => {
    try {
        let allMembers = [];
        let membersSnapshot = await admin.firestore().collection("members").get();

        membersSnapshot.forEach((doc) => {
            allMembers.push({
                id: doc.id,
                ...doc.data()
            });
        });

        return res.status(200).json({
            totalMembers: allMembers.length,
            members: allMembers
        });
    } catch (error) {
        return res.status(500).json({ error: "Failed to retrieve members" });
    }
})

app.post('/member', (req, res) => {

    const body = req.body
    const name = body.name
    const age = body.age
    const type = body.type

    if (name === '' || age === '' || type === '') {
        return res.status(400).json({ error: "Bad request : Some fields were empty." })
    }

    try {
        const member = {
            name,
            age,
            type
        }

        admin.firestore().collection("members").add(member).then((doc) => {
            return res.status(200).json({
                id: doc.id,
                ...member
            })
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: "Internal Server error" })
    }
})


app.patch('/member/:id', async (req, res) => {
    const body = req.body
    const id = req.params.id
    const name = body.name
    const age = body.age
    const type = body.type

    if (id === '' || name === '' || age === '' || type === '') {
        return res.status(400).json({ error: "Bad request : Some fields were empty." })
    }

    try {
        const docRef = admin.firestore().collection("members").doc(id);
        docRef.get()
            .then((docSnapshot) => {
                if (docSnapshot.exists) {
                    const member = {
                        name,
                        age,
                        type
                    }

                    admin.firestore().collection("members").doc(id).set(member)
                        .then(() => {
                            return res.status(200).json({
                                id: id,
                                ...member
                            })
                        })

                } else {
                    return res.status(404).json({ error: "Member does not exists" });
                }
            })
    } catch (error) {
        return res.status(500).json({ error: "Internal Server error" })
    }
})

app.delete('/member/:id', (req, res) => {
    const id = req.params.id

    if (id === '') {
        return res.status(400).json({ error: "Bad request : Please add id as parameters." })
    }

    try {
        const docRef = admin.firestore().collection("members").doc(id);

        docRef.delete()
            .then(() => {
                return res.status(200).json({ message: "Member deleted successfully" });
            })
    } catch (error) {
        console.error("Error deleting document:", error);
        return res.status(500).json({ error: "Failed to delete document" });
    }
})


app.listen(3300, () => {
    console.log('Listening on port: 3300')
})