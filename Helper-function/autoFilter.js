const PROVINCE = "QNA";
const DISTRICT = "TKY";
const sDS = "Tất cả";

const START = "01032023";
const END = "03042023";

const { By } = require("selenium-webdriver");

async function AutoFilter(driver) {
  try {
    // Chọn Tỉnh
    await driver.findElement(By.id("pProvince")).sendKeys(PROVINCE);

    //Chọn Danh sách
    await driver.findElement(By.id("pDS")).sendKeys(sDS);

    // Chọn ngày bắt đầu
    await driver.findElement(By.id("pfromDate")).sendKeys(START);

    // Chọn ngày kết thúc
    await driver.findElement(By.id("pToDate")).sendKeys(END);

    // await driver.sleep(100);
    // // Chọn Huyện
    // await driver.findElement(By.id("pDistrict")).sendKeys(DISTRICT);
  } catch (e) {
    console.log("DEBUG -->", "Lỗi không tìm thấy trường thông tin trong filter", e);
    return;
  }
}

module.exports = AutoFilter;
