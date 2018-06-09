const napa = require('napajs');
const uuidv4 = require('uuid/v4');

module.exports = (size = 8) =>
{
  const tpool = napa.zone.create( `GO_THREAD_POOL: ${uuidv4()}` , { workers: size });

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
