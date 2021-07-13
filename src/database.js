const nano = require('nano')('http://admin:admin@localhost:5984');

const multimedia = nano.db.use('multimedia');
const express = require('express')
const router = express.Router();

router.post('/add', async function (req, res) {
  try{
    const response = await multimedia.insert(req.body);
    res.send({
      status: response.ok,
    })
  } catch(e){
    res.send({
      status: false
    })
  }

})

router.put('/edit/:id', async function (req, res) {
  try{
    const response = await multimedia.insert({
      _id: req.params.id,
      _rev: req.body._rev
    });
    res.send({
      status: response.ok
    })
  } catch(e){
    res.send({
      status: false
    })
  }

})


router.delete('/delete/:id', async function (req, res) {
  try{
    const response = await multimedia.destroy(req.params.id,req.body._rev);
    res.send({
      status: response.ok
    })
  } catch(e){
    res.send({
      status: false
    })
  }

})

module.exports = router
