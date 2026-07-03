import { Router } from "express";

const router = Router();

let documents = [];

router.post('/', (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Text is required'
      })
    }

    let doc = {
      id: Date.now(),
      text,
      createAt: new Date(),
    }

    documents.push(doc);
    console.log(documents)

    res.status(200).json({
      success: true,
      message: 'Document recieved',
      docId: doc.id,
      length: text.length
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      err: 'Something went wrong'
    })
  }
})

export default router;
