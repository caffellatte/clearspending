# clearspending
Easily get, search and select for contracts, customers and suppliers on ClearSpending using their API.

## Installing

Using npm:

```bash
$ npm install --save clearspending
```

## Examples

### Import module

```javascript
const clearspending = require('clearspending')
const Clearspending = new clearspending()
```

### Grants

Receive full information about the grant by the ID (get)

```javascript
Clearspending
  .getGrants({
    id: '42'
  })
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

Full-text search for grants

```javascript
Clearspending
  .searchGrants({productsearch: 'бетон'})
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

```javascript
Clearspending
  .searchGrants({ogrn:'1036167000066'})
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

Grants selection

```javascript
Clearspending
  .selectGrants({daterange:'01.01.2014-31.12.2014'})
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

### Customers

Getting customer information by identifier

```javascript
Clearspending
  .getCustomer({spzregnum: '01731000070'})
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

Full-text search by customer's contracts

```javascript
Clearspending
  .searchCustomers({orgtype:'3', sort:'-contractsSum'})
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

Full-text search by customers (select)

```javascript
Clearspending
  .selectCustomers({orgtype:'3', sort:'-contractsSum'})
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

### Contracts

Getting contract's information by identifier

```javascript
Clearspending
  .getContracts({regnum:'0173100000414000011'})
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

Full-text search by contracts

```javascript
Clearspending
  .searchContracts({
    pricerange: '10000-50000',
    customerregion: '05',
    sort:'-price'
  })
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

Select by contracts

```javascript
Clearspending
  .selectContracts({
    industrial: 'A',
    fz: '94'
  })
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

### Suppliers

Getting supplier information by identifier

```javascript
Clearspending
  .getSuppliers({
    inn: '6450614330',
    kpp: '645001001'
  })
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

Full-text search by suppliers

```javascript
Clearspending
.then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

Select by suppliers

```javascript
Clearspending
Clearspending
  .searchSuppliers({
    regioncode: '35',
    orgform: 'i94',
    sort: '-contractsSum'
  })
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```

### Recive information (statistics) about the database (number of records, update date, etc.).

```javascript
Clearspending
  .dbInfo({
    info: 'all'
  })
  .then((result) => {console.log(result)}).catch((err) => {console.log(err)})
```
