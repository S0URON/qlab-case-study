import fs from "fs";

const data = JSON.parse(fs.readFileSync("./cleaned_data.json", "utf8"));

const stationCorrections = {
  // Axle Installation
  "Axel installation": "Axle Installation",
  "Axel insatllation": "Axle Installation",
  "Axel instalaltion": "Axle Installation",
  "Axel installaiton": "Axle Installation",
  "Axel installatoin": "Axle Installation",
  "Axel installtaion": "Axle Installation",
  "Axel instlalation": "Axle Installation",
  "Axel intsallation": "Axle Installation",
  "Axel isntallation": "Axle Installation",
  "Axel nistallation": "Axle Installation",
  "Axeli nstallation": "Axle Installation",
  "xAel installation": "Axle Installation",

  // Dashboard Installation
  "Dashboard installation": "Dashboard Installation",
  "aDshboard installation": "Dashboard Installation",
  "Dahsboard installation": "Dashboard Installation",
  "Dasbhoard installation": "Dashboard Installation",
  "Dashbaord installation": "Dashboard Installation",
  "Dashboadr installation": "Dashboard Installation",
  "Dashboar dinstallation": "Dashboard Installation",
  "Dashboard insatllation": "Dashboard Installation",
  "Dashboard installaiton": "Dashboard Installation",
  "Dashboard installatino": "Dashboard Installation",
  "Dashboard installatoin": "Dashboard Installation",
  "Dashboard instlalation": "Dashboard Installation",
  "Dashboard nistallation": "Dashboard Installation",
  "Dashborad installation": "Dashboard Installation",
  "Dsahboard installation": "Dashboard Installation",

  // EV Battery Installation
  "EV battery installation": "EV Battery Installation",
  "EV abttery installation": "EV Battery Installation",
  "EV batetry installation": "EV Battery Installation",
  "EV battery insatllation": "EV Battery Installation",
  "EV battery instalaltion": "EV Battery Installation",
  "EV battery installaiton": "EV Battery Installation",
  "EV battery installatino": "EV Battery Installation",
  "EV battery installatoin": "EV Battery Installation",
  "EV battery instlalation": "EV Battery Installation",
  "EV battery intsallation": "EV Battery Installation",
  "EV battery isntallation": "EV Battery Installation",
  "EV battery nistallation": "EV Battery Installation",
  "EV batteryi nstallation": "EV Battery Installation",
  "EV batteyr installation": "EV Battery Installation",
  "EVb attery installation": "EV Battery Installation",
  "VE battery installation": "EV Battery Installation",

  // First Row Seats Installation
  "First row seats installation": "First Row Seats Installation",
  "First orw seats installation": "First Row Seats Installation",
  "First row seats installaiton": "First Row Seats Installation",
  "First row seats installatino": "First Row Seats Installation",
  "First row seats intsallation": "First Row Seats Installation",
  "First row seats isntallation": "First Row Seats Installation",
  "First row seats nistallation": "First Row Seats Installation",
  "First rwo seats installation": "First Row Seats Installation",
  "Fisrt row seats installation": "First Row Seats Installation",

  // Headlight Installation
  "Headlight installation": "Headlight Installation",
  "Headlgiht installation": "Headlight Installation",
  "Headlight installatino": "Headlight Installation",
  "Headlight instlalation": "Headlight Installation",

  // Rear Bumper Installation
  "Rear bumper installation": "Rear Bumper Installation",
  "Raer bumper installation": "Rear Bumper Installation",
  "Rea rbumper installation": "Rear Bumper Installation",
  "Rear bumper installaiton": "Rear Bumper Installation",
  "Rear bumper installatino": "Rear Bumper Installation",
  "Rera bumper installation": "Rear Bumper Installation",
  "eRar bumper installation": "Rear Bumper Installation",

  // Second Row Seats Installation
  "Second row seats installation": "Second Row Seats Installation",
  "Second row esats installation": "Second Row Seats Installation",
  "Second row seat sinstallation": "Second Row Seats Installation",
  "Second row seats installatino": "Second Row Seats Installation",
  "Second row seats installatoin": "Second Row Seats Installation",
  "Second row seats installtaion": "Second Row Seats Installation",
  "Second row seats intsallation": "Second Row Seats Installation",
  "Second row setas installation": "Second Row Seats Installation",
  "Second rows eats installation": "Second Row Seats Installation",
  "Second rwo seats installation": "Second Row Seats Installation",
  "eScond row seats installation": "Second Row Seats Installation",

  // Steering Wheel Installation
  "Steering wheel installation": "Steering Wheel Installation",
  "Steerign wheel installation": "Steering Wheel Installation",
  "Steerin gwheel installation": "Steering Wheel Installation",
  "Steering hweel installation": "Steering Wheel Installation",
  "Steering wehel installation": "Steering Wheel Installation",
  "Steering wheel instalaltion": "Steering Wheel Installation",
  "Steering wheel installtaion": "Steering Wheel Installation",
  "Steering wheel instlalation": "Steering Wheel Installation",
  "Steering wheel isntallation": "Steering Wheel Installation",
  "Steering wheeli nstallation": "Steering Wheel Installation",
  "tSeering wheel installation": "Steering Wheel Installation",

  // Tire And Rim Installation
  "Tire and rim installation": "Tire And Rim Installation",
  "Tier and rim installation": "Tire And Rim Installation",
  "Tir eand rim installation": "Tire And Rim Installation",
  "Tire an drim installation": "Tire And Rim Installation",
  "Tire and irm installation": "Tire And Rim Installation",
  "Tire and rim instalaltion": "Tire And Rim Installation",
  "Tire and rim installaiton": "Tire And Rim Installation",
  "Tire and rim installatoin": "Tire And Rim Installation",
  "Tire and rim installtaion": "Tire And Rim Installation",
  "Tire and rim instlalation": "Tire And Rim Installation",
  "Tire and rim intsallation": "Tire And Rim Installation",
  "Tire andr im installation": "Tire And Rim Installation",
  "iTre and rim installation": "Tire And Rim Installation",

  // Windshield Installation
  "Windshield installation": "Windshield Installation",
  "Widnshield installation": "Windshield Installation",
  "Windhsield installation": "Windshield Installation",
  "Windshiedl installation": "Windshield Installation",
  "Windshield instalaltion": "Windshield Installation",
  "Windshield installatino": "Windshield Installation",
  "Windshield installtaion": "Windshield Installation",
  "Windshield instlalation": "Windshield Installation",
  "Windshield intsallation": "Windshield Installation",
  "Windshield isntallation": "Windshield Installation",
  "Windshield nistallation": "Windshield Installation",
  "Windshieldi nstallation": "Windshield Installation",
  "Windshiled installation": "Windshield Installation",
  "Winsdhield installation": "Windshield Installation",
  "iWndshield installation": "Windshield Installation",

  // Wire Harness Installation
  "Wire harness installation": "Wire Harness Installation",
  "Wier harness installation": "Wire Harness Installation",
  "Wire ahrness installation": "Wire Harness Installation",
  "Wire hanress installation": "Wire Harness Installation",
  "Wire harenss installation": "Wire Harness Installation",
  "Wire harness insatllation": "Wire Harness Installation",
  "Wire harness installaiton": "Wire Harness Installation",
  "Wire harness installatino": "Wire Harness Installation",
  "Wire harness installatoin": "Wire Harness Installation",
  "Wire harness installtaion": "Wire Harness Installation",
  "Wire harness instlalation": "Wire Harness Installation",
  "Wire harness intsallation": "Wire Harness Installation",
  "Wire harness isntallation": "Wire Harness Installation",
  "Wire harness nistallation": "Wire Harness Installation",
  "Wire hraness installation": "Wire Harness Installation",
  "Wireh arness installation": "Wire Harness Installation",
  "Wrie harness installation": "Wire Harness Installation",
  "iWre harness installation": "Wire Harness Installation",
};

// Apply corrections
data.forEach((entry) => {
  const original = entry.station;
  if (stationCorrections[original]) {
    entry.station = stationCorrections[original];
  }
});

// Save result
fs.writeFileSync("./cleaned_data.json", JSON.stringify(data, null, 2));
console.log(
  "Station values normalized and saved to cleaned_stations_data.json"
);
