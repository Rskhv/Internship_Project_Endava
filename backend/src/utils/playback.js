const COMPLETION_THRESHOLD=95;
function normalizeProgress(value){
  const number=Number(value);
  if(!Number.isFinite(number))throw new TypeError('Progress must be a finite number.');
  const percentage=Math.min(100,Math.max(0,number));
  const completed=percentage>=COMPLETION_THRESHOLD;
  return {progressPercentage:completed?100:percentage,completed};
}
module.exports={COMPLETION_THRESHOLD,normalizeProgress};
