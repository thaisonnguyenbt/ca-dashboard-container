const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, 1000));

const getVal = async (val) => {
  await sleep(1000);
  throw new Error('xxxx');
};

(async () => {
  await getVal()
    .then((val) => {
      console.log('then');
    })
    .catch((e) => {
      console.log(e);
    });

  console.log('xxx');
})();
