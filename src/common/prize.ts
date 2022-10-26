import { equalArray } from './general';

// eveluate ticket, return its bonus and wepot number
export function evalTicket(acc: any, drawBalls: number[], bonusMultiplier: number) {
	let wepot = 0;
	let bonus = 0;
	let bonusMax = 0;
	let numberOfBets = acc.numOfBets;
	for (let i = 0; i < numberOfBets; i++) {
		const prize = testPrize(drawBalls, acc.balls.slice(i * 5, (i + 1) * 5));
		const ballsBonus = prizeBonus(prize);
		if (ballsBonus == -1) wepot += 1; // WePot winner
		if (ballsBonus > 0) {
			bonus += ballsBonus * bonusMultiplier;
			bonusMax = Math.max(bonusMax, ballsBonus * bonusMultiplier);
			// if (bonus >= 30 * 1e9) console.log(acc.owner.toBase58(), bonus);
		}
	}
	
	return {bonus, wepot, bonusMax};
}

// test balls, return winning level
export function testPrize(drawBalls:number[], testBalls:number[]) {
	const ball_len = drawBalls.length;
	if (ball_len != testBalls.length) {
		return [0, 0];
	}

	let front = 0;
	for (let i = 0; i < ball_len - 1; i++) {
		for (let j = 0; j < ball_len - 1; j++) {
			if (drawBalls[i] == testBalls[j]) {
				front += 1;
				break;
			}
		}
	}
	const tail = (drawBalls[ball_len - 1] == testBalls[ball_len - 1]) ? 1 : 0;
	return [front, tail];
}
	
// calculate winning amount
export function prizeBonus(match: number[]) {
	if (equalArray(match, [0, 1])) { return 20_000_000; } // Level8
	else if (equalArray(match, [1, 1])) { return 20_000_000 } // level7
	else if (equalArray(match, [2, 0])) { return 20_000_000 } // level6
	else if (equalArray(match, [2, 1])) { return 100_000_000 } // level5
	else if (equalArray(match, [3, 0])) { return 250_000_000 } // level4
	else if (equalArray(match, [3, 1])) { return 2_500_000_000 } // level3
	else if (equalArray(match, [4, 0])) { return 30_000_000_000 } // Level2
	else if (equalArray(match, [4, 1])) { return -1 } // top prize
	else { return 0 }
}