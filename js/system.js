/*:
 * @target MZ
 * @plugindesc ระบบครบ Stardew Lite: กลางวัน-กลางคืน, ฤดูกาล, ปลูกผัก, เศรษฐกิจ, HUD, ร้านค้า, รดน้ำ, สัตว์เลี้ยง v1.2
 * @author GPT
 */

(() => {
  const Seasons = ["Spring", "Summer", "Fall", "Winter"];
  const DaysPerSeason = 30;

  const Crops = {
    1: { name: "Carrot", growDays: 4, seasons: ["Spring"], itemId: 10, basePrice: 50 },
    2: { name: "Corn", growDays: 6, seasons: ["Summer", "Fall"], itemId: 11, basePrice: 80 },
  };

  const Economy = {
    Spring: 1.0,
    Summer: 1.2,
    Fall: 1.5,
    Winter: 0.8
  };

  const farmKey = "StardewFarmData";

  const Time = {
    hour: 6,
    minute: 0,
    day: 1,
    seasonIndex: 0,

    advanceTime(minutes) {
      this.minute += minutes;
      if (this.minute >= 60) {
        this.minute -= 60;
        this.hour++;
      }
      if (this.hour >= 24) {
        this.hour = 6;
        this.minute = 0;
        this.day++;
        if (this.day > DaysPerSeason) {
          this.day = 1;
          this.seasonIndex = (this.seasonIndex + 1) % Seasons.length;
        }
        updateCropsGrowth();
      }
    },

    getSeason() {
      return Seasons[this.seasonIndex];
    },

    getTimeString() {
      return `${this.hour}:${this.minute.toString().padStart(2, '0')}`;
    },

    getDateString() {
      return `${this.getSeason()} Day ${this.day}`;
    }
  };

  const getFarmData = () => {
    if (!$gameMap._farmData) $gameMap._farmData = {};
    return $gameMap._farmData;
  };

  Game_Interpreter.prototype.plantCrop = function(seedId, x, y) {
    const crop = Crops[seedId];
    if (!crop || !crop.seasons.includes(Time.getSeason())) return;
    const farm = getFarmData();
    const key = `${x},${y}`;
    farm[key] = {
      seedId: seedId,
      dayPlanted: Time.day,
      seasonPlanted: Time.getSeason(),
      daysWithoutWater: 0
    };
    $gameMap.requestRefresh();
  };

  Game_Interpreter.prototype.waterCrop = function(x, y) {
    const farm = getFarmData();
    const key = `${x},${y}`;
    const data = farm[key];
    if (!data) return;
    data.daysWithoutWater = 0;
    console.log(`รดน้ำที่ ${key}`);
  };

  function updateCropsGrowth() {
    const farm = getFarmData();
    for (const key in farm) {
      const data = farm[key];
      const crop = Crops[data.seedId];

      if (data.seasonPlanted !== Time.getSeason()) {
        delete farm[key];
        continue;
      }

      data.daysWithoutWater++;
      if (data.daysWithoutWater > 2) {
        delete farm[key];
        console.log(`พืชที่ ${key} ตายเพราะขาดน้ำ`);
      }
    }
    $gameMap.requestRefresh();
  }

  Game_Interpreter.prototype.harvestCrop = function(x, y) {
    const farm = getFarmData();
    const key = `${x},${y}`;
    const data = farm[key];
    if (!data) return;
    const crop = Crops[data.seedId];
    const daysGrown = Time.day - data.dayPlanted;
    if (daysGrown >= crop.growDays) {
      const multiplier = Economy[Time.getSeason()];
      const price = Math.floor(crop.basePrice * multiplier);
      $gameParty.gainItem($dataItems[crop.itemId], 1);
      $gameParty.gainGold(price);
      delete farm[key];
      $gameMap.requestRefresh();
    }
  };

  Scene_Map.prototype.update = function() {
    Scene_Base.prototype.update.call(this);
    if (Graphics.frameCount % 300 === 0) {
      Time.advanceTime(10);
      $gameMap.requestRefresh();
    }
    this.updateHud();
  };

  Scene_Map.prototype.createAllWindows = function() {
    Scene_Message.prototype.createAllWindows.call(this);
    this.createHudWindow();
    this.createCalendarWindow();
  };

  Scene_Map.prototype.createHudWindow = function() {
    const rect = new Rectangle(0, 0, 300, 100);
    this._hudWindow = new Window_HUD(rect);
    this.addChild(this._hudWindow);
  };

  Scene_Map.prototype.createCalendarWindow = function() {
    const rect = new Rectangle(Graphics.width - 300, 0, 300, 100);
    this._calendarWindow = new Window_Calendar(rect);
    this.addChild(this._calendarWindow);
  };

  Scene_Map.prototype.updateHud = function() {
    if (this._hudWindow) this._hudWindow.refresh();
    if (this._calendarWindow) this._calendarWindow.refresh();
  };

  class Window_HUD extends Window_Base {
    initialize(rect) {
      super.initialize(rect);
      this.refresh();
    }
    refresh() {
      this.contents.clear();
      this.drawText(Time.getDateString(), 0, 0, 280);
      this.drawText(Time.getTimeString(), 0, this.lineHeight(), 280);
    }
  }

  class Window_Calendar extends Window_Base {
    initialize(rect) {
      super.initialize(rect);
      this.refresh();
    }
    refresh() {
      this.contents.clear();
      this.drawText(`Calendar`, 0, 0, 280);
      this.drawText(Time.getSeason(), 0, this.lineHeight(), 280);
      this.drawText(`Day ${Time.day} / ${DaysPerSeason}`, 0, this.lineHeight() * 2, 280);
    }
  }

  Game_Interpreter.prototype.openFarmShop = function() {
    const goods = [
      [0, 10, 0, 0],
      [0, 11, 0, 0]
    ];
    SceneManager.push(Scene_Shop);
    SceneManager.prepareNextScene(goods, false);
  };

  Game_Interpreter.prototype.collectAnimalProduct = function(itemId, goldAmount) {
    $gameParty.gainItem($dataItems[itemId], 1);
    $gameParty.gainGold(goldAmount);
    console.log(`เก็บผลผลิตสัตว์ ได้ ${goldAmount}G`);
  };

})();
