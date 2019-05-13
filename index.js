// index.js from https://github.com/caffellatte/clearspending
// Native
const url = require('url')

// Packages
const request = require('request-promise-native')

const ERROR = {
  MISSING_ID: {
    code: 'missing_id',
    message: 'Missing `id` parameter'
  },
  MISSING_INFO: {
    code: 'missing_info',
    message: 'Missing `info` parameter'
  },
  MISSING_SPZREGNUM: {
    code: 'missing_spzregnum',
    message: 'Missing `spzregnum` or `id` parameter'
  },
  MISSING_SEARCH_GRANTS: {
    code: 'missing_search_grants',
    message: 'Missing `productsearch`, `name_organization_search`, ' +
             '`address_search`, `operator`, `daterange`, `OGRN`, `price`,' +
             '`grant_status` parameters (specify at least one parameter)'
  },
  MISSING_SELECT_GRANTS: {
    code: 'missing_select_grants',
    message: 'Missing `year`, `status`, `grant`, `price`, `daterange` ' +
             'parameters (specify at least one parameter)'
  },
  MISSING_SEARCH_CUSTOMERS: {
    code: 'missing_search_customers',
    message: 'Missing `namesearch`, `address`, `namesearchlist`, ' +
             '`spzregnum`, `okpo`, `okved`, `name`, `inn`, `kpp`, `ogrn`, ' +
             '`okogu`, `okato`, `subordination`, `orgtype`, `kladregion`, ' +
             '`fz`, `regioncode`, `orgclass` parameters (specify at least ' +
             'one parameter)'
  },
  MISSING_SELECT_CUSTOMERS: {
    code: 'missing_select_customers',
    message: 'Missing `spzregnum`, `okpo`, `okved`, `name`, `inn`, `kpp`, ' +
             '`ogrn`, `okogu`, `okato`, `subordination`, `orgtype`, ' +
             '`kladregion`, `regioncode`, `orgclass` parameters (specify at ' +
             'least one parameter)'
  },
  MISSING_REGNUM: {
    code: 'missing_regnum',
    message: 'Missing `regnum` or `id` parameter'
  },
  MISSING_GET_SUPPLIER: {
    code: 'missing_spzregnum',
    message: 'Missing `inn`, `kpp` or `id` parameter'
  },
  MISSING_SEARCH_SUPPLIERS: {
    code: 'missing_search_suppliers',
    message: 'Missing `inn`, `kpp`, `namesearch`, `address`, `regioncode`, ' +
             '`orgform`, `orgclass`, `inblacklist`,  parameter'
  }
}

const handleError = err => new Promise((resolve, reject) => reject(err))

class Clearspending {
  constructor () {
    this.request = request.defaults({
      baseUrl: 'http://openapi.clearspending.ru/restapi/v3/',
      timeout: 30000,
      json: true
    })
  }

  handleRequest (config, selector) {
    return new Promise((resolve, reject) => {
      this.request(config)
        .then(res => {
          const data = selector ? res[selector] : res
          resolve(data)
        })
        .catch(err => {
          let errData
          if (err.data && err.data.err) {
            errData = err.data.err
          } else if (err.data) {
            errData = err.data
          } else {
            errData = err.toString()
          }
          reject(errData)
        })
    })
  }

  /*
   * Receive full information about the grant by the ID (get)
   * @ id - grants lacked unique identifiers, artificial identifiers were added.
   */
  getGrant (query) {
    if (!query.id) {
      return handleError(ERROR.MISSING_ID)
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/grants/get/',
        query: {
          id: query.id
        }
      }),
      method: 'get'
    }, 'grants')
  }

  /*
   * Full-text search for grants (search)
   * @ productsearch - full text search in all items
   * @ name_organization_search - full text search by company name
   * @ address_search - full text search by organization address
   * @ operator - search by grant operators
   * @ daterange - date of grant signing (dd.mm.yyyy-dd.mm.yyyy)
   * @ OGRN - search by OGRN code in the contract
   * @ price - contract price range (minFloat-maxFloat)
   * @ grant_status - grant status (all or winner)
   * @ total - total records found
   * @ page - response page
   * @ perpage - number of records in one request (max - 50)
   */
  searchGrants (query) {
    if (!query.productsearch && !query.name_organization_search &&
      !query.address_search && !query.operator && !query.daterange &&
      !query.ogrn && !query.price && !query.grant_status) {
      return handleError(ERROR.MISSING_SEARCH_GRANTS)
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/grants/search/',
        query: {
          productsearch: query.productsearch,
          name_organization_search: query.name_organization_search,
          address_search: query.address_search,
          operator: query.operator,
          daterange: query.daterange,
          OGRN: query.ogrn,
          price: query.price,
          grant_status: query.grant_status,
          total: query.total || '',
          page: query.page || 1,
          perpage: query.perpage || 50
        }
      }),
      method: 'get'
    }, 'grants')
  }

  /*
   * Grants selection (select)
   * @ year -  year in which the grant received
   * @ status - grant status (all or winner)
   * @ grant - grants can be found by key (grants115 and grants348)
   * @ price - contract price range (minFloat-maxFloat)
   * @ daterange - date of grant signing (dd.mm.yyyy-dd.mm.yyyy)
   * @ total - total records found
   * @ page - response page
   * @ perpage - number of records in one request (max - 50)
   */
  selectGrants (query) {
    if (!query.year && !query.status && !query.grant && !query.price &&
        !query.daterange) {
      return handleError(ERROR.MISSING_SELECT_GRANTS)
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/grants/select/',
        query: {
          year: query.year,
          status: query.status,
          grant: query.grant,
          price: query.price,
          daterange: query.daterange,
          total: query.total || '',
          page: query.page || 1,
          perpage: query.perpage || 50
        }
      }),
      method: 'get'
    }, 'grants')
  }

  /*
   * Getting customer information by identifier (get)
   * @ spzregnum - customer registration number (consolidated list of customers)
   * @ id - customer ID (mongo_id)
   */
  getCustomer (query) {
    if (!query.spzregnum) {
      if (!query.id) {
        return handleError(ERROR.MISSING_SPZREGNUM)
      }
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/customers/get/',
        query: {
          spzregnum: query.spzregnum,
          id: query.id
        }
      }),
      method: 'get'
    }, 'customers')
  }

  /*
   * Full-text search by customer's contracts (search)
   *
   * + General properties:
   * @ namesearch - full text search by customer name
   * @ address - full text search by customer location
   * @ namesearchlist - search by customer name (type: list)
   * @ spzregnum - customer registration number (consolidated list of customers)
   * @ okpo - search by OKPO code
   * @ okved - search by OKVED code
   * @ name - full text search by customer name
   * @ inn - search by customer's INN
   * @ kpp - search by customer's KPP
   * @ ogrn - search by OGRN code
   * @ okogu - search by OKOGU code
   * @ okato - search by OKATO code
   * @ subordination - search by customer level (using numeric level codes)
   * @ orgtype - search by organization type (numeric type codes are used)
   * @ kladregion - search by customer region
   * @ fz - search by federal law number
   * @ regioncode - search by customer's region (using numeric region codes)
   * @ orgclass - "npo" or "university"
   *
   * + Navigation properties
   * @ total - total records found
   * @ page - response page
   * @ perpage - number of records in one request (max - 50)
   *
   * + Sorting properties
   * @ sort - sort customers by contractsCount or contractsSum
   *   contractsCount - sorting by the number of contracts with parameters [1, -1]
   *   contractsSum - sorting by the amount of contracts with parameters [1, -1].
   *
   */
  searchCustomers (query) {
    if (!query.namesearch && !query.address && !query.namesearchlist &&
        !query.spzregnum && !query.okpo && !query.okved && !query.name &&
        !query.inn && !query.kpp && !query.ogrn && !query.okogu &&
        !query.okato && !query.subordination && !query.orgtype &&
        !query.kladregion && !query.fz && !query.regioncode &&
        !query.orgclass) {
      return handleError(ERROR.MISSING_SEARCH_CUSTOMERS)
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/customers/search/',
        query: {
          namesearch: query.namesearch,
          address: query.address,
          namesearchlist: query.namesearchlist,
          spzregnum: query.spzregnum,
          okpo: query.okpo,
          okved: query.okved,
          name: query.name,
          inn: query.inn,
          kpp: query.kpp,
          ogrn: query.ogrn,
          okogu: query.okogu,
          okato: query.okato,
          subordination: query.subordination,
          orgtype: query.orgtype,
          kladregion: query.kladregion,
          fz: query.fz,
          regioncode: query.regioncode,
          orgclass: query.orgclass,
          total: query.total || '',
          page: query.page || 1,
          perpage: query.perpage || 50,
          sort: query.sort
        }
      }),
      method: 'get'
    }, 'customers')
  }

  /*
   * Full-text search by customers (select)
   *
   * + General properties:
   * @ spzregnum - customer registration number (consolidated list of customers)
   * @ okpo - search by OKPO code
   * @ okved - search by OKVED code
   * @ name - full text search by customer name
   * @ inn - search by customer's INN
   * @ kpp - search by customer's KPP
   * @ ogrn - search by OGRN code
   * @ okogu - search by OKOGU code
   * @ okato - search by OKATO code
   * @ subordination - search by customer level (using numeric level codes)
   * @ orgtype - search by organization type (numeric type codes are used)
   * @ kladregion - search by customer region
   * @ regioncode - search by customer's region (using numeric region codes)
   * @ orgclass - "npo" or "university"
   *
   * + Navigation properties
   * @ total - total records found
   * @ page - response page
   * @ perpage - number of records in one request (max - 50)
   *
   * + Sorting properties
   * @ sort - sort customers by contractsCount or contractsSum
   *   contractsCount - sorting by the number of contracts with parameters [1, -1]
   *   contractsSum - sorting by the amount of contracts with parameters [1, -1].
   *
   */
  selectCustomers (query) {
    if (!query.spzregnum && !query.okpo && !query.okved && !query.name &&
        !query.inn && !query.kpp && !query.ogrn && !query.okogu &&
        !query.okato && !query.subordination && !query.orgtype &&
        !query.kladregion && !query.regioncode && !query.orgclass) {
      return handleError(ERROR.MISSING_SELECT_CUSTOMERS)
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/customers/select/',
        query: {
          spzregnum: query.spzregnum,
          okpo: query.okpo,
          okved: query.okved,
          name: query.name,
          inn: query.inn,
          kpp: query.kpp,
          ogrn: query.ogrn,
          okogu: query.okogu,
          okato: query.okato,
          subordination: query.subordination,
          orgtype: query.orgtype,
          kladregion: query.kladregion,
          regioncode: query.regioncode,
          orgclass: query.orgclass,
          total: query.total || '',
          page: query.page || 1,
          perpage: query.perpage || 50,
          sort: query.sort
        }
      }),
      method: 'get'
    }, 'customers')
  }

  /*
   * Getting contract's information by identifier (get)
   * @ regnum - contract's registration number
   * @ id - contract's ID (?)
   */
  getContracts (query) {
    if (!query.regnum) {
      if (!query.id) {
        return handleError(ERROR.MISSING_REGNUM)
      }
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/contracts/get/',
        query: {
          regnum: query.regnum,
          id: query.id
        }
      }),
      method: 'get'
    }, 'contracts')
  }

  /*
   * Full-text search by contracts (search)
   *
   * + General properties:
   * @ productsearch - full text search in all items in the contract
   * @ productsearchlist - full-text search for a set of items in the contract
   * @ regnum - contract's registration number
   * @ customerinn - search for all contracts that have a customer with a given INN
   * @ customerkpp - Search for all contracts that have a customer with a given KPP
   * @ supplierinn - search for all contracts that have a supplier with a given INN
   * @ supplierkpp - Search for all contracts that have a supplier with a given KPP
   * @ okdp_okpd - search by OKDP or OKPD codes in the contract
   * @ budgetlevel - budget level search
   * @ customerregion - search by customer's region (using numeric region codes)
   * @ currentstage - contract status
   * @ daterange - date of grant signing (dd.mm.yyyy-dd.mm.yyyy)
   * @ pricerange - contract price range (minFloat-maxFloat)
   * @ placing - type of contract placement
   * @ fz - search by federal law number
   *
   * @ currentstage - params:
   *   E  - Execution
   *   EC - Execution Completed
   *   ET - Execution Terminated
   *   IN - Invalidate
   *
   * + Navigation properties
   * @ total - total records found
   * @ page - response page
   * @ perpage - number of records in one request (max - 50)
   *
   * + Sorting properties
   * @ sort - sort contracts by contractsCount or contractsSum
   *   price - sorting by the price of contracts with parameters [1, -1]
   *   signDate - sorting by the date of contracts with parameters [1, -1].
   *
   */
  searchContracts (query) {
    if (!query.productsearch && !query.productsearchlist && !query.regnum &&
        !query.customerinn && !query.customerkpp && !query.supplierinn &&
        !query.supplierkpp && !query.okdp_okpd && !query.budgetlevel &&
        !query.customerregion && !query.currentstage && !query.daterange &&
        !query.pricerange && !query.placing && !query.fz) {
      return handleError(ERROR.MISSING_SEARCH_CUSTOMERS)
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/contracts/search/',
        query: {
          productsearch: query.productsearch,
          productsearchlist: query.productsearchlist,
          regnum: query.regnum,
          customerinn: query.customerinn,
          customerkpp: query.customerkpp,
          supplierinn: query.supplierinn,
          supplierkpp: query.supplierkpp,
          okdp_okpd: query.okdp_okpd,
          budgetlevel: query.budgetlevel,
          customerregion: query.customerregion,
          currentstage: query.currentstage,
          daterange: query.daterange,
          pricerange: query.pricerange,
          placing: query.placing,
          fz: query.fz,
          total: query.total || '',
          page: query.page || 1,
          perpage: query.perpage || 50,
          sort: query.sort
        }
      }),
      method: 'get'
    }, 'contracts')
  }

  /*
   * Select by contracts (select)
   *
   * + General properties:
   - @ productsearch - full text search in all items in the contract
   - @ productsearchlist - full-text search for a set of items in the contract
   * @ regnum - contract's registration number
   * @ customerinn - search for all contracts that have a customer with a given INN
   * @ customerkpp - Search for all contracts that have a customer with a given KPP
   * @ supplierinn - search for all contracts that have a supplier with a given INN
   * @ supplierkpp - Search for all contracts that have a supplier with a given KPP
   - @ okdp_okpd - search by OKDP or OKPD codes in the contract
   + @ okdp - search by OKDP codes in the contract
   + @ okpd - search by OKPD codes in the contract
   * @ budgetlevel - budget level search
   * @ customerregion - search by customer's region (using numeric region codes)
   + @ industrial - industry (use the letter of the section)
   * @ currentstage - contract status
   * @ daterange - date of grant signing (dd.mm.yyyy-dd.mm.yyyy)
   * @ pricerange - contract price range (minFloat-maxFloat)
   * @ placing - type of contract placement
   * @ fz - search by federal law number
   *
   * @ currentstage - params:
   *   E  - Execution
   *   EC - Execution Completed
   *   ET - Execution Terminated
   *   IN - Invalidate
   *
   * + Navigation properties
   * @ total - total records found
   * @ page - response page
   * @ perpage - number of records in one request (max - 50)
   *
   * + Sorting properties
   * @ sort - sort contracts by contractsCount or contractsSum
   *   price - sorting by the price of contracts with parameters [1, -1]
   *   signDate - sorting by the date of contracts with parameters [1, -1].
   *
   */
  selectContracts (query) {
    if (!query.regnum && !query.customerinn && !query.customerkpp &&
        !query.supplierinn && !query.supplierkpp && !query.okdp &&
        !query.okpd && !query.budgetlevel && !query.customerregion &&
        !query.currentstage && !query.daterange && !query.pricerange &&
        !query.placing && !query.fz && !query.industrial) {
      return handleError(ERROR.MISSING_SEARCH_CUSTOMERS)
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/contracts/select/',
        query: {
          regnum: query.regnum,
          customerinn: query.customerinn,
          customerkpp: query.customerkpp,
          supplierinn: query.supplierinn,
          supplierkpp: query.supplierkpp,
          okdp: query.okdp,
          okpd: query.okpd,
          budgetlevel: query.budgetlevel,
          customerregion: query.customerregion,
          industrial: query.industrial,
          currentstage: query.currentstage,
          daterange: query.daterange,
          pricerange: query.pricerange,
          placing: query.placing,
          fz: query.fz,
          total: query.total || '',
          page: query.page || 1,
          perpage: query.perpage || 50,
          sort: query.sort
        }
      }),
      method: 'get'
    }, 'contracts')
  }

  /*
   * Getting supplier information by identifier (get)
   * @ inn - supplier's INN code
   * @ kpp - supplier's KPP code
   * @ id - contract's ID (?)
   */
  getSuppliers (query) {
    if (!query.inn && !query.kpp) {
      if (!query.id) {
        return handleError(ERROR.MISSING_GET_SUPPLIER)
      }
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/suppliers/get/',
        query: {
          inn: query.inn,
          kpp: query.kpp,
          id: query.id
        }
      }),
      method: 'get'
    }, 'suppliers')
  }

  /*
   * Full-text search by suppliers (search)
   *
   * + General properties:
   * @ inn - search by supplier's INN code
   * @ kpp - search by supplier's KPP code
   * @ namesearch - full text search by supplier's name
   * @ address - full text search by supplier's location
   * @ regioncode - search by customer's region (using numeric region codes)
   * @ orgform - search by organization form (organization codes are used)
   * @ orgclass - "npo" or "university"
   * @ inblacklist - whether the supplier has violations, parameters ["1", "true", "yes", "on", "y", "t"] or ["0", "false", "no", "off", "n", "f"]
   *
   * + Navigation properties
   * @ total - total records found
   * @ page - response page
   * @ perpage - number of records in one request (max - 50)
   *
   * + Sorting properties
   * @ sort - sort customers by contractsCount or contractsSum
   *   contractsCount - sorting by the number of contracts with parameters [1, -1]
   *   contractsSum - sorting by the amount of contracts with parameters [1, -1].
   *
   */
  searchSuppliers (query) {
    if (!query.inn && !query.kpp && !query.namesearch && !query.address &&
        !query.regioncode && !query.orgform && !query.orgclass &&
        !query.inblacklist) {
      return handleError(ERROR.MISSING_SEARCH_SUPPLIERS)
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/suppliers/search/',
        query: {
          inn: query.inn,
          kpp: query.kpp,
          namesearch: query.namesearch,
          address: query.address,
          regioncode: query.regioncode,
          orgform: query.orgform,
          orgclass: query.orgclass,
          inblacklist: query.inblacklist,
          total: query.total || '',
          page: query.page || 1,
          perpage: query.perpage || 50,
          sort: query.sort
        }
      }),
      method: 'get'
    }, 'suppliers')
  }

  /*
   * Select by suppliers (select)
   *
   * + General properties:
   * @ inn - search by supplier's INN code
   * @ kpp - search by supplier's KPP code
   * @ regioncode - search by customer's region (using numeric region codes)
   * @ orgform - search by organization form (organization codes are used)
   * @ orgclass - "npo" or "university"
   * @ inblacklist - whether the supplier has violations, parameters ["1", "true", "yes", "on", "y", "t"] or ["0", "false", "no", "off", "n", "f"]
   *
   * + Navigation properties
   * @ total - total records found
   * @ page - response page
   * @ perpage - number of records in one request (max - 50)
   *
   * + Sorting properties
   * @ sort - sort customers by contractsCount or contractsSum
   *   contractsCount - sorting by the number of contracts with parameters [1, -1]
   *   contractsSum - sorting by the amount of contracts with parameters [1, -1].
   *
   */
  selectSuppliers (query) {
    if (!query.inn && !query.kpp && !query.regioncode && !query.orgform &&
        !query.orgclass && !query.inblacklist) {
      return handleError(ERROR.MISSING_SEARCH_SUPPLIERS)
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/suppliers/select/',
        query: {
          inn: query.inn,
          kpp: query.kpp,
          regioncode: query.regioncode,
          orgform: query.orgform,
          orgclass: query.orgclass,
          inblacklist: query.inblacklist,
          total: query.total || '',
          page: query.page || 1,
          perpage: query.perpage || 50,
          sort: query.sort
        }
      }),
      method: 'get'
    }, 'suppliers')
  }

  /*
   * Information (statistics) about the database (number of records, update date, etc.).
   */
  dbInfo (query) {
    if (!query.info) {
      return handleError(ERROR.MISSING_INFO)
    }

    return this.handleRequest({
      url: url.format({
        pathname: '/db_info/statistics/',
        query: {
          info: query.info
        }
      }),
      method: 'get'
    }, 'db_info')
  }
}

module.exports = Clearspending
