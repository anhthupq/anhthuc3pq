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
  let query = {}
  if(!req.query.q) {
  	query = {
  		nested: {
		  path: "doc",
		  query: {
		    match_all : {}
		  }
		}
  	}
  } else {
  	query = {
		nested: {
		  path: "doc",
		  query: {
		    multi_match: {
		      query: req.query.q,
		      fields: ['doc.TÊN', 'doc.THỂ LOẠI', 'doc.ĐẠO DIỄN', 'doc.KỊCH BẢN', 'doc.BIÊN TẬP'],
		      analyzer: "standard_asciifolding"
		    }
		  }
		}
      }
  }
    body = { query }
  try {
    const { body: { hits } } = await client.search({
      from: req.page || 0,
      size: req.limit || 1000,
      index: 'multimedia',
      body
    });

    data = {
      total: hits.total.value,
      docs: hits.hits.map(item => ({
        id: item._id,
        doc: item._source.doc
      })).sort((first,second)=> {
	const name1 = first.doc['TÊN']
	const name2 = second.doc['TÊN']
	if(name1<name2) return -1;
	if(name1>name2) return 1;
	return 0;
      })
    }
  } catch (e) {
    console.log('search', e)
  }

  res.send(data)
})


module.exports = router
