// 着火点となる要素
const paragraphs = document.querySelectorAll<HTMLInputElement>(".paragraph");
// グラデーションさせる要素
const heading = document.querySelectorAll<HTMLInputElement>(".heading");

// threshold の設定(交差感知の割合の数)
const buildThresholdList = (): Array<number> => {
  let thresholds = [];
  let numSteps = 20;

  for (let i = 1; i <= numSteps; i++) {
    let ratio = i / numSteps;
    thresholds.push(ratio);
  }
  return thresholds;
}

/**
* threshold
* 関数を実行するタイミングを 0〜1 で記述。
* ターゲットとなる要素が見え始めた瞬間と見え終わりの瞬間が 0、半分通過したときは 0.5、すべて見えている状態が 1。
* その場合は交差量が 0、50％、100％の時にコールバック関数が呼ばれます。
* default = 0
*/
const options = {
  threshold: buildThresholdList()
};
// console.log(options);


/**
* showElements
* 要素が表示されたら実行
* @param {entries}
*
*/
const showElements = (entries): void => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      let ratio = Math.round(entry.intersectionRatio * 100); //パーセンテージに変換
      console.log("ratio🍓: ", ratio + "%");

      heading.forEach(elem => {
        elem.style.backgroundImage = `
        linear-gradient(
        45deg,
        rgb(37, 47, 255) ${0 - ratio}%,
        rgb(124, 192, 226) ${100 - ratio}%,
        rgb(37, 47, 255) ${200 - ratio}%
      )`;
      })
    }
  });
}

// create instance
const observer = new IntersectionObserver(showElements, options);

// 各 .paragraph に到達したら発動。
paragraphs.forEach(paragraph => {
  observer.observe(paragraph);
});
