// susu-group/main.js
const { Decimal } = require("decimal.js");

class Member {
  constructor(name) {
    this.name = name;
    this.payments = {}; // week -> Decimal amount
  }
}

class SusuGroup {
  constructor(weeklyAmount) {
    this.weeklyAmount = new Decimal(weeklyAmount);
    this.members = [];
    this.currentWeek = 1;
    this.payoutHistory = [];
  }

  addMember(name) {
    if (this.members.find(m => m.name === name)) {
      throw new Error("Duplicate member");
    }
    this.members.push(new Member(name));
  }

  recordPayment(name, amount) {
    const member = this.members.find(m => m.name === name);
    if (!member) throw new Error("Unknown member");
    if (amount <= 0) throw new Error("Invalid payment amount");

    const amt = new Decimal(amount);
    const alreadyPaid = member.payments[this.currentWeek] || new Decimal(0);

    if (alreadyPaid.plus(amt).greaterThan(this.weeklyAmount)) {
      throw new Error("Payment exceeds weekly amount");
    }

    member.payments[this.currentWeek] = alreadyPaid.plus(amt);
  }

  closeWeek() {
    const debts = {};
    this.members.forEach(m => {
      const paid = m.payments[this.currentWeek] || new Decimal(0);
      if (paid.lessThan(this.weeklyAmount)) {
        debts[m.name] = this.weeklyAmount.minus(paid).toFixed(2);
      }
    });

    if (Object.keys(debts).length > 0) {
      return { status: "incomplete", debts };
    }

    const recipient = this.members[(this.currentWeek - 1) % this.members.length].name;
    const pot = this.weeklyAmount.times(this.members.length);
    this.payoutHistory.push({ week: this.currentWeek, recipient, amount: pot.toFixed(2) });
    this.currentWeek += 1;

    return { status: "paid", recipient, amount: pot.toFixed(2) };
  }

  report() {
    const memberStatus = {};
    this.members.forEach(m => {
      memberStatus[m.name] = (m.payments[this.currentWeek] || new Decimal(0)).toFixed(2);
    });

    return {
      week: this.currentWeek,
      members: memberStatus,
      payoutHistory: this.payoutHistory
    };
  }
}

module.exports = { SusuGroup };
