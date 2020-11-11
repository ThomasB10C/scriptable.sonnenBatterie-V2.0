// sonnenbatterie.js V1.0
// Run Script with Scriptable.
// Parameter use by Scriptable
// 10C.Thomas Burchert
// MIT-Lizenz
// Script/Widget nutzt die API der sonnenBatterie
// Anzeige von: Production, Consumption, GridFeedIn,
// Pac_total, SOC
// Parameter: IP-Adresse der sonnenBatterie im LAN
// Merke: Stromflüsse, die das System verlassen, bei
// Einspeisung, Ladung, werden als negative Werte 
// angezeigt (Abweichung vom API-Standard bei der
// GridFeedIn/Einspeisung).

const APIurl ="http://999.999.999.99:8080/api/v1/status"

// Init Widget for data view
let widget = await createWidget()
if (!config.runsInWidget) {
   await widget.presentSmall()
}
 
Script.setWidget(widget)
Script.complete()

async function createWidget(items) {
  let fm = FileManager.local()
  let dir = fm.documentsDirectory()
  let path = fm.joinPath(dir, "scriptable-sonnenbatterie.json")

  const list = new ListWidget()
  list.addSpacer(16)

  try {
    let r = new Request(APIurl)
    // setting the mobile header
    r.headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 13_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.1.1 Mobile/15E148 Safari/604.1"
    }
    
    let data, freshdata = 0
    try {
      // Fetch data from battery
      data = await r.loadJSON()
      // Write JSON to iCloud file
      fm.writeString(path, JSON.stringify(data, null, 2))
      freshdata = 1
    } catch (err) {
      // Read data from iCloud file
      data = JSON.parse(fm.readString(path), null)
      if (!data || !data.lastUpdateTime) {
        const errorList = new ListWidget()
        errorList.addText("Please check connection, the battery is just not reachable")
        return errorList
      }
    }
    // Header
    const line1 = list.addText("sonnenBatterie")
    line1.font = Font.boldSystemFont(14)
    list.addSpacer()
    
    // print lines
    const line2 = list.addText("Produktion: " + Math.round(data.Production_W/100)/10 + " kW")
    line2.font = Font.mediumSystemFont(12)
    line2.textColor = Color.orange()
    
    const line3 = list.addText("Verbrauch: " + Math.round(data.Consumption_W/100)/10 + " kW")
    line3.font = Font.mediumSystemFont(12)
    
    const line4= list.addText("Netz: " + (Math.round(data.GridFeedIn_W/100)/10 *-1)+ " kW")
    line4.font = Font.mediumSystemFont(12)
    
    const line5= list.addText("Batterie: " + Math.round(data.Pac_total_W/100)/10 + " kW")
    line5.font = Font.mediumSystemFont(12)
   
    const line6= list.addText("SOC: "  + data.USOC + " %")
    line6.font = Font.mediumSystemFont(12)
    line6.textColor = Color.green()
    list.addSpacer()
        
    if (freshdata == 0) {
      line1.textColor = Color.darkGray()
      line2.textColor = Color.darkGray()
      line3.textColor = Color.darkGray()
      line4.textColor = Color.darkGray()
      line5.textColor = Color.darkGray()
      line6.textColor = Color.darkGray()
    }
    
  } catch(err) {
    list.addText("Error fetching JSON from your battery!!!")
  }

  // Add time of last widget refresh:
  list.addSpacer(4)
  const now = new Date();
  const timeLabel = list.addDate(now)
  timeLabel.font = Font.mediumSystemFont(10)
  timeLabel.centerAlignText()
  timeLabel.applyTimeStyle()
  timeLabel.textColor = Color.darkGray()
  return list
}
// end of the script