const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200/' })
const express = require('express')
const router = express.Router();

const mapper = {
  'name': 'doc.TÊN',
  'type': 'doc.THỂ LOẠI',
  'director': 'doc.ĐẠO DIỄN',
  'content': 'doc.KỊCH BẢN',
  'writer': 'doc.BIÊN TẬP'
}

router.get('/search', async function (req, res) {
  let data = {
    total: 0,
    docs: []
  };
  let body = {}
  let matcher = {}

  // search all fields
  if(req.query.q) {
    matcher = {
      query: req.query.q, 
      fields: ['doc.TÊN', 'doc.THỂ LOẠI', 'doc.ĐẠO DIỄN', 'doc.KỊCH BẢN', 'doc.BIÊN TẬP'],
      analyzer: "standard_asciifolding"
    }
  } else {
    const keys = Object.keys(mapper);
    for(let i=0; i<keys.length;++i) {
      const key = keys[i];
      if(req.query[key]) {
        matcher = {
          query: req.query[key],
          fields: [mapper[key]],
          analyzer: "standard_asciifolding"
        }
        break;
      }
    }
  }


  if (matcher) {
    body = {
      query: {
        nested: {
          path: "doc",
          query: {
            multi_match: matcher
          }
        }

      }
  }
  }
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
