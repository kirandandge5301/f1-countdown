export interface RaceInsight {
  meetingName: string;
  circuit: string;
  historical: string;
  record: string;
  trivia: string;
}

export const RACE_INSIGHTS: Record<string, RaceInsight> = {
  'Australian Grand Prix': {
    meetingName: 'Australian Grand Prix',
    circuit: `Albert Park is built within a public park in Melbourne's inner suburbs. The circuit has hosted F1 since 1996 and is known for its bumpy surface.`,
    historical: `Ayrton Senna won the first F1 race at Albert Park in 1996. The venue marked a turning point for grand prix racing in Australia.`,
    record: `Juan Pablo Montoya holds the lap record with a time of 1:24.125 set in 2004. Albert Park averages 305 km/h top speed.`,
    trivia: `The circuit sits on public parkland that reverts to parkland use after the race. Albert Park Lake is home to over 200 bird species.`,
  },
  'Chinese Grand Prix': {
    meetingName: 'Chinese Grand Prix',
    circuit: `Shanghai International Circuit is a 5.451 km high-speed track designed by Tilke. It hosted its first F1 race in 2004.`,
    historical: `Ferrari secured their first win in China in 2007 with Felipe Massa. The race remained on the calendar despite initial uncertainty.`,
    record: `The fastest lap at Shanghai is 1:32.238, achieved in 2018. The circuit features the longest straight in F1 at 1.079 km.`,
    trivia: `Shanghai International Circuit was built for the 2010 World Expo and is partially covered by a butterfly wing-shaped roof.`,
  },
  'Japanese Grand Prix': {
    meetingName: 'Japanese Grand Prix',
    circuit: `Suzuka International Racing Course is a unique figure-eight layout with two separate road courses joined by a grade separation bridge.`,
    historical: `Suzuka hosted the first Japanese Grand Prix in 1976. Ayrton Senna and Alain Prost clashed here twice during the 1989-1990 championship battles.`,
    record: `Sebastian Vettel set the current lap record of 1:27.064 in 2018. Suzuka is known for high-speed corners and challenging weather.`,
    trivia: `The figure-eight design means drivers cross over themselves on a bridge. Suzuka is a challenge test for many drivers.`,
  },
  'Bahrain Grand Prix': {
    meetingName: 'Bahrain Grand Prix',
    circuit: `Bahrain International Circuit is located in the desert of the island nation. The Sakhir circuit features both high-speed straights and technical corners.`,
    historical: `Bahrain hosted its first Grand Prix in 2004 and was F1's first race in the Middle East. Michael Schumacher won the inaugural event.`,
    record: `Lewis Hamilton holds the lap record of 1:31.447 set in 2020. The circuit is famous for sudden dust storms that can affect visibility.`,
    trivia: `The circuit is named after the ancient capital of Bahrain. Evening races at Bahrain are illuminated by powerful floodlights.`,
  },
  'Saudi Arabian Grand Prix': {
    meetingName: 'Saudi Arabian Grand Prix',
    circuit: `Jeddah Corniche Circuit is the second-longest F1 track at 6.174 km. Built along the Red Sea coast, it features exceptionally high average speeds.`,
    historical: `Saudi Arabia hosted its first Grand Prix in 2021. Max Verstappen won the inaugural race after a dramatic qualifying session.`,
    record: `Charles Leclerc set the lap record of 1:27.511 in 2022. Jeddah averages over 240 km/h, making it one of the fastest circuits.`,
    trivia: `The circuit is lit by LED floodlights for night racing. High-speed crashes are common, making safety a priority at this venue.`,
  },
  'Miami Grand Prix': {
    meetingName: 'Miami Grand Prix',
    circuit: `Miami International Autodrome is located in the grounds of Hard Rock Stadium. The 5.41 km track features unique street circuit characteristics.`,
    historical: `Miami hosted its first Grand Prix in 2022. Lewis Hamilton won the inaugural event in a thrilling race with multiple lead changes.`,
    record: `Max Verstappen set the lap record of 1:29.708 in 2023. The circuit has seen competitive racing between top teams.`,
    trivia: `The circuit weaves through the parking lots and grounds of Hard Rock Stadium. Fans can enjoy the race from the stadium's upper levels.`,
  },
  'Monaco Grand Prix': {
    meetingName: 'Monaco Grand Prix',
    circuit: `The Circuit de Monaco is the most iconic street circuit in the world. The tight 3.337 km layout winds through the streets of Monte Carlo.`,
    historical: `Monaco has hosted the Grand Prix since 1929. Ayrton Senna holds the record for most wins at Monaco with 6 victories.`,
    record: `Charles Leclerc set the qualifying record of 1:10.346 in 2023. The race averages only 160 km/h despite being competitive.`,
    trivia: `Monaco is the only Grand Prix where drivers get a street circuit experience on a permanent F1 calendar. The race is broadcast globally.`,
  },
  'Canadian Grand Prix': {
    meetingName: 'Canadian Grand Prix',
    circuit: `Circuit Gilles Villeneuve is a temporary street circuit on Île Notre-Dame in Montreal. The 4.361 km track is fast and technical.`,
    historical: `Named after legendary Canadian driver Gilles Villeneuve, the circuit first hosted F1 in 1978. Canada has produced multiple F1 drivers.`,
    record: `Lewis Hamilton holds the lap record of 1:21.097 set in 2017. The circuit features a famous hairpin and several overtaking opportunities.`,
    trivia: `The circuit sits on a man-made island in the Saint Lawrence River. F1 races in Montreal are known for unpredictable weather.`,
  },
  'Spanish Grand Prix': {
    meetingName: 'Spanish Grand Prix',
    circuit: `Circuit de Barcelona-Catalunya is a 4.655 km permanent road course. Known as the de facto pre-season test track, it's used for winter testing.`,
    historical: `Barcelona has hosted the Spanish Grand Prix since 1991. The circuit is one of the most familiar to drivers due to regular testing.`,
    record: `Max Verstappen set the lap record of 1:18.149 in 2023. The circuit has seen record-breaking performances in recent years.`,
    trivia: `Barcelona is where F1 teams conduct winter testing, making it extensively studied by all teams. The track evolves each season.`,
  },
  'Austrian Grand Prix': {
    meetingName: 'Austrian Grand Prix',
    circuit: `Red Bull Ring is a compact 4.318 km circuit located in the Austrian Alps. The high-altitude venue offers spectacular scenery.`,
    historical: `Named after energy drink company Red Bull, the circuit previously hosted the A1 Ring. It returned to F1 in 2014 after extensive renovations.`,
    record: `Max Verstappen holds the lap record of 1:05.619 set in 2023. The fast circuit favors aerodynamic efficiency.`,
    trivia: `Red Bull Ring is at 680m elevation, making it one of the highest F1 circuits. The surrounding Styrian Alps provide dramatic backdrops.`,
  },
  'British Grand Prix': {
    meetingName: 'British Grand Prix',
    circuit: `Silverstone Circuit is a fast 5.891 km track featuring some of F1's most demanding corners. Located in Northamptonshire, it's steeped in history.`,
    historical: `Silverstone hosted the first-ever Grand Prix in 1950. The circuit remains iconic for its high-speed corners like Copse and Becketts.`,
    record: `Lewis Hamilton set the lap record of 1:27.369 in 2020. British drivers have dominated at Silverstone over the decades.`,
    trivia: `Silverstone sits on the grounds of a former RAF airbase used in World War II. The circuit is beloved by fans for its atmosphere.`,
  },
  'Hungarian Grand Prix': {
    meetingName: 'Hungarian Grand Prix',
    circuit: `Hungaroring is a tight, technical 4.381 km circuit near Budapest. The low-grip track challenges drivers with complex corner sequences.`,
    historical: `Hungary's first Grand Prix was held at Hungaroring in 1986. The circuit is known for close racing due to limited overtaking opportunities.`,
    record: `Lewis Hamilton holds the lap record of 1:16.627 set in 2020. The track favors precision and smooth driving over brute power.`,
    trivia: `Hungaroring is one of Europe's most intimate circuits, with fans sitting close to the action. Weather can change dramatically during race day.`,
  },
  'Belgian Grand Prix': {
    meetingName: 'Belgian Grand Prix',
    circuit: `Circuit de Spa-Francorchamps is located in the Ardennes forest. At 7.004 km, it's one of F1's longest and most challenging circuits.`,
    historical: `Spa has hosted racing since 1924 and the Grand Prix since 1983. The circuit is famous for heavy rain and unpredictable weather conditions.`,
    record: `Max Verstappen set the lap record of 1:43.252 in 2022. Spa regularly produces spectacular first-lap incidents and drama.`,
    trivia: `Eau Rouge and Raidillon are among F1's most iconic corners. The circuit sits at altitude with rapid elevation changes throughout.`,
  },
  'Dutch Grand Prix': {
    meetingName: 'Dutch Grand Prix',
    circuit: `Circuit Zandvoort is a 4.259 km track located near Amsterdam on the Dutch coast. The track features banked corners and close racing.`,
    historical: `Zandvoort first hosted F1 in 1952 and returned in 2021 after a 35-year absence. The 2021 return coincided with Max Verstappen's rise to dominance.`,
    record: `Max Verstappen holds the lap record of 1:11.097 set in 2023. The banked corners create unique racing dynamics.`,
    trivia: `Zandvoort's banking creates unique forces on drivers and equipment. The circuit is famous for the passionate Orange Army of F1 fans.`,
  },
  'Italian Grand Prix': {
    meetingName: 'Italian Grand Prix',
    circuit: `Autodromo Nazionale di Monza is the fastest circuit on the F1 calendar at 5.793 km. Located north of Milan, it's a temple to speed.`,
    historical: `Monza hosted the first Grand Prix in 1950 and continues as one of the most iconic venues. Ferrari calls Monza home, adding passion to every race.`,
    record: `Juan Pablo Montoya set the lap record of 1:21.046 in 2004. The circuit features the famous first chicane and fast sweeping bends.`,
    trivia: `Monza sits in a royal park and features tree-lined straights. The parabolica bend is one of F1's most challenging high-speed corners.`,
  },
  'Azerbaijan Grand Prix': {
    meetingName: 'Azerbaijan Grand Prix',
    circuit: `Baku City Circuit is a 6.003 km street track through the capital city. The narrow confines produce unpredictable racing and drama.`,
    historical: `Baku hosted its first Grand Prix in 2016. The circuit has produced multiple championship-deciding moments and dramatic finishes.`,
    record: `Max Verstappen set the lap record of 1:43.009 in 2023. The long straights interspersed with tight corners create tactical challenges.`,
    trivia: `The circuit passes historic landmarks including the Baku Boulevard. Red flags from crashes and safety car periods are common at Baku.`,
  },
  'Singapore Grand Prix': {
    meetingName: 'Singapore Grand Prix',
    circuit: `Marina Bay Street Circuit is a 5.285 km night race through Singapore's streets. The tight layout and night racing create unique challenges.`,
    historical: `Singapore's first night Grand Prix was held in 2008, pioneering F1 night racing. Fernando Alonso won the inaugural race.`,
    record: `Sebastian Vettel holds the lap record of 1:41.905 set in 2019. The circuit demands precision with minimal run-off areas.`,
    trivia: `Singapore is F1's first-ever night race, requiring special lighting. The hot, humid climate tests driver fitness and hydration.`,
  },
  'United States Grand Prix': {
    meetingName: 'United States Grand Prix',
    circuit: `Circuit of the Americas (COTA) is a 5.515 km track near Austin, Texas. The circuit combines elements of famous corners from around the world.`,
    historical: `COTA hosted the first modern-era American Grand Prix in 2012. The track immediately became popular for its varied corners and passionate crowd.`,
    record: `Max Verstappen set the lap record of 1:34.231 in 2023. The Turns 1 uphill section creates a dramatic backdrop for spectators.`,
    trivia: `COTA is designed by Hermann Tilke and features a replica Maggotts section from Silverstone. The iconic tower provides excellent spectator views.`,
  },
  'Mexico City Grand Prix': {
    meetingName: 'Mexico City Grand Prix',
    circuit: `Autódromo Hermanos Rodríguez is located at 2250m elevation in Mexico City. The thin air creates unique aerodynamic challenges.`,
    historical: `Named after Mexican racing brothers, the circuit hosted F1 between 1962-1970, then returned in 2015. Mexico has produced multiple F1 drivers.`,
    record: `Max Verstappen set the lap record of 1:17.774 in 2023. The high altitude reduces engine power and top speed.`,
    trivia: `The thin air at 2250m elevation means engines produce 25-30% less power. The circuit passes through the Estadio Azteca football stadium.`,
  },
  'Brazilian Grand Prix': {
    meetingName: 'Brazilian Grand Prix',
    circuit: `Autódromo José Carlos Pace (Interlagos) is a 4.309 km track with significant elevation changes. Located in São Paulo, it's known for drama.`,
    historical: `Brazil has produced multiple world champions including Senna and Prost. Interlagos has hosted the Grand Prix since 1973 with legendary moments.`,
    record: `George Russell set the lap record of 1:10.540 in 2023. The wet weather history of Interlagos produces memorable races.`,
    trivia: `Interlagos is famous for sudden rain showers and dramatic weather changes. The circuit's S-curves honor the legendary Brazilian racing tradition.`,
  },
  'Abu Dhabi Grand Prix': {
    meetingName: 'Abu Dhabi Grand Prix',
    circuit: `Yas Marina Circuit is a 5.281 km track on Yas Island near Abu Dhabi. The modern facility features a hotel built into the circuit.`,
    historical: `Abu Dhabi hosted its first Grand Prix in 2009. The circuit's position as season finale has produced multiple championship deciders.`,
    record: `Lewis Hamilton set the lap record of 1:26.103 in 2021. The championship-deciding race adds extra drama to Yas Marina.`,
    trivia: `The Yas Marina Hotel sits on the circuit, with race action passing by guest windows. The track features significant energy consumption.`,
  },
};
