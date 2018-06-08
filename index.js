const napa = require('napajs');

module.exports = (size = 8) => 
{
  const tpool = napa.zone.create( "JSCOR_THREAD_POOL" , { workers: size });

  function go(task)
  {
    return tpool.execute(task);
  }

  function getPoolSize()
  {
    return size;
  }

  return {
    go:go,
    getPoolSize:getPoolSize
  }
};
