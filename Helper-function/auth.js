const USERNAME = "C3_THIENLMN";
const PASSWORD = "abcd@1234";

const { By } = require("selenium-webdriver");

async function signIn(driver, userName, password) {
  await driver.findElement(By.name("txtUserName")).sendKeys(userName || USERNAME);
  await driver.findElement(By.name("txtPassword")).sendKeys(password || PASSWORD);
  await driver.findElement(By.name("DONE")).click();
}

module.exports = signIn;
