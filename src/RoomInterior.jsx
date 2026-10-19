const ROOM_THEMES={
  Morale:{wall:"#d4bfa9",floor:"#947d72",detail:"#efc88a",furniture:"Common tables & conversation"},
  Knowledge:{wall:"#aec8c6",floor:"#698a8c",detail:"#e3dcae",furniture:"Bookshelves & research desks"},
  Compute:{wall:"#b5c7d7",floor:"#68849b",detail:"#8de1ce",furniture:"Monitors & testing benches"},
  Materials:{wall:"#cbb99b",floor:"#8d806c",detail:"#eec07f",furniture:"Workbench & prototypes"},
  Records:{wall:"#b8b5ca",floor:"#77768d",detail:"#d7cbf1",furniture:"Archives & evidence shelves"}
};
function LibraryShelves({palette}) {
  return <g>
    {[95,760].map((x,index)=><g key={index} transform={"translate("+x+",170)"}>
      <rect width="190" height="270" rx="5" fill="#4b545c" stroke="#283a46" strokeWidth="7"/>
      {[0,1,2].map(j=><g key={j}>
        <rect x="9" y={78+j*86} width="173" height="11" rx="2" fill="#e3d6ba"/>
        {Array.from({length:8},(_,k)=><rect key={k} x={14+k*21} y={15+j*86+(k%3)*4} width="14" height={59-(k%3)*4} rx="1" fill={["#c78779",palette.detail,"#7eab9f","#8f92c7"][k%4]} />)}
      </g>)}
    </g>)}
  </g>;
}
function Computers({palette}) {
  return <g>
    {[180,450,720].map((x,i)=><g key={x} transform={"translate("+x+",315)"}>
      <rect width="155" height="85" rx="9" fill="#263b4b" stroke="#192a39" strokeWidth="7"/>
      <rect x="12" y="12" width="130" height="59" rx="4" fill="#2c777d"/>
      <path d={"M20 "+(50-i*5)+" L57 31 L91 48 L131 25"} stroke={palette.detail} strokeWidth="5" fill="none"/>
      <rect x="68" y="85" width="17" height="22" fill="#273c4b"/>
      <rect x="43" y="104" width="67" height="9" rx="4" fill="#273c4b"/>
    </g>)}
  </g>;
}
function Workshop({palette}) {
  return <g>
    {[180,430,690].map((x,i)=><g key={x} transform={"translate("+x+",325)"}>
      <rect y="56" width="165" height="17" fill="#6f4a37" stroke="#4f3833" strokeWidth="3"/>
      <rect x="13" y="69" width="14" height="62" fill="#6f4a37"/>
      <rect x="142" y="69" width="14" height="62" fill="#6f4a37"/>
      <rect x="46" y="7" width="68" height="49" rx="4" fill={palette.detail} stroke="#45535b" strokeWidth="6"/>
      <path d={i===0?"M61 34 H99":i===1?"M60 20 V46 M90 20 V46":"M60 18 L98 46 M98 18 L60 46"} stroke="#46616b" strokeWidth="8" strokeLinecap="round"/>
    </g>)}
  </g>;
}
function Tables({palette}) {
  return <g>
    {[180,430,680].map((x,i)=><g key={x} transform={"translate("+x+",365)"}>
      <ellipse cx="75" cy="35" rx="101" ry="40" fill="#5d5556" opacity=".18"/>
      <ellipse cx="75" cy="10" rx="95" ry="34" fill={palette.detail} stroke="#805e55" strokeWidth="7"/>
      <rect x="66" y="40" width="18" height="73" fill="#805e55"/>
      {[0,1].map((j)=><rect key={j} x={j*135} y="46" width="24" height="47" rx="5" fill="#638c8c" stroke="#284a54" strokeWidth="5"/>)}
      <rect x="56" y="-2" width="37" height="24" rx="5" fill="#f8e6c2"/>
    </g>)}
  </g>;
}
export default function RoomInterior({building,scene,agent,onBack,onPractice}) {
  const p=ROOM_THEMES[building.gain]||ROOM_THEMES.Morale;
  return <div className="interior-wrapper">
    <div className="interior-heading">
      <div><span className="interior-kicker">YOU HAVE ENTERED · {scene.toUpperCase()} · DEMO</span><h3>{building.title}</h3><p>{building.subtitle} · {p.furniture}</p></div>
      <button className="secondary-button" type="button" onClick={onBack}>← Back outside</button>
    </div>
    <svg className="room-canvas" viewBox="0 0 1050 595" role="img" aria-label={"Illustrated interior of "+building.title}>
      <rect width="1050" height="595" fill={p.wall}/>
      <path d="M0 435 L1050 435 V595 H0 Z" fill={p.floor}/>
      <path d="M0 435 H1050" stroke="#425461" strokeWidth="9"/>
      <rect x="65" y="56" width="920" height="80" rx="9" fill="#253d46" stroke="#ede1cb" strokeWidth="6"/>
      <text x="525" y="109" textAnchor="middle" fontSize="32" fontWeight="800" fill="#f5e6bd">{building.title}</text>
      <rect x="420" y="174" width="220" height="130" rx="10" fill="#1e4453" stroke="#e5d8bd" strokeWidth="10"/>
      <text x="530" y="217" textAnchor="middle" fontSize="19" fill="#a6ddd2" fontWeight="bold">LAU PRACTICE</text>
      <path d="M456 240 H604 M456 258 H580" stroke={p.detail} strokeWidth="7" strokeLinecap="round"/>
      {(building.gain==="Knowledge" || building.gain==="Records")?<LibraryShelves palette={p}/>:
        (building.gain==="Compute")?<Computers palette={p}/>:
        (building.gain==="Materials")?<Workshop palette={p}/>:<Tables palette={p}/>}
      <rect x="25" y="520" width="345" height="47" rx="7" fill="#1e3341" opacity=".95"/>
      <text x="45" y="550" fontSize="18" fontWeight="700" fill="#e5e9e0">SIMULATED CAMPUS INTERIOR</text>
      <path d="M860 527 H980 M980 527 L963 515 M980 527 L963 539" stroke="#f8ddaa" strokeWidth="7" fill="none"/>
    </svg>
    <div className="interior-footer">
      <div><strong>{agent.name} is visiting</strong><span>Touring adds one simulated {building.gain.toLowerCase()} resource. No external work has occurred.</span></div>
      <button className="primary-button" type="button" onClick={onPractice}>+ Give {agent.name} a practice assignment</button>
    </div>
  </div>;
}
