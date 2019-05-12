# clearspending
Easily get, search and select for contracts, customers and suppliers on ClearSpending using their API.

## Usage

### Information (statistics) about the database (number of records, update date, etc.).

```javascript
const clearspending = require('clearspending')
const Clearspending = new clearspending()

Clearspending
  .dbInfo({
    info: 'all'
  })
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```
