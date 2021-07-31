const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200/' })
const express = require('express')
const router = express.Router();


router.get('/search', async function (req, res) {
  let data = {
    total: 0,
    docs: []
  };
  let body = {
  }
  let queryString = req.query.q
  if (queryString) {
    body = {
      query: {
        nested: {
          path: "doc",
          query: {
            multi_match: {
              query: queryString,
              fields: ['doc.TÊN', 'doc.THỂ LOẠI', 'doc.ĐẠO DIỄN', 'doc.KỊCH BẢN', 'doc.BIÊN TẬP'],
              analyzer: "standard_asciifolding"
            }
          }
        }
      }
    }
  }
  try {
    const { body: { hits } } = await client.search({
      from: req.page || 0,
      size: req.limit || 100,
      index: 'multimedia',
      body
    });

    data = {
      total: hits.total.value,
      docs: hits.hits.map(item => ({
        id: item._id,
        doc: item._source.doc
      }))
    }
  } catch (e) {
    console.log('search', e)
  }

  res.send(data)
})


module.exports = router
