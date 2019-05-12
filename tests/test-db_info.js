const ClearspendingClient = require('../')
const Clearspending = new ClearspendingClient()
const test = require('tape')

test('db_info', (t) => {
  Clearspending
    .dbInfo({
      info: 'all'
    })
    .then((result) => {
      t.equals(result.total, 1, '1')
      t.end()
    }).catch((err) => {
      t.notOk(err, 'no error')
      console.log(err)
    })
})
