const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })
const express = require('express')
const router = express.Router();

// respond with "hello world" when a GET request is made to the homepage

router.get('/search', async function (req, res) {
  let data = {};
  let query = {};
  try {
    if(Object.keys(req.query).length !== 0){
      try {
        let firstKey = 'doc.'+Object.keys(req.query)[0]; // "plainKey"
        let firstValue = Object.values(req.query)[0]; // "plain value"
        if(firstValue){
          query = {
            query:{
              match: {
                [firstKey]: firstValue
              }
            }
          }
        }
      } catch(e){

      }
    }
    const { body: { hits } } = await client.search({
      from:  req.page  || 0,
      size:  req.limit || 100,
      index: 'multimedia',
      body:  query
    });
    data = {
      total: hits.total.value,
      docs: hits.hits.map(item => ({
        id: item._id,
        doc: item._source.doc
      }))
    }
  } catch(e){
    console.log('/search',e)
  }

  res.send(data)
})


module.exports = router
