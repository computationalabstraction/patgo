const napa = require('napajs');
const uuidv4 = require('uuid/v4');

module.exports = (size = 8) =>
{
  const tpool = napa.zone.create( `GO_THREAD_POOL: ${uuidv4()}` , { workers: size });
  const registry = {};

  function go(task,...params)
  {
    if(params != undefined)
    {
      return tpool.execute(task,params);
    }
    else
    {
      return tpool.execute(task);
    }
  }

  function getPoolSize()
  {
    return size;
  }

  function register(id,func)
  {
    registry[id] = func;
  }

  function deregister(id)
  {
    delete registry[id];
  }

  function get(id)
  {
    return registry[id];
  }

  function addLib(code_string)
  {
    tpool.broadcast(code_string);
  }

  return {
    go:go,
    getPoolSize:getPoolSize,
    register:register,
    deregister:deregister,
    get:get,
    addLib:addLib
  }
};
