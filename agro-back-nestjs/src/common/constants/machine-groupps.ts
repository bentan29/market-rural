export const MACHINE_GROUPS = [
  {
    label: "Tractores",
    items: [
      { value: "tractor", label: "Tractor" },
      { value: "orchard_tractor", label: "Tractor frutero" },
      { value: "forestry_tractor", label: "Tractor forestal" },
      { value: "skidder", label: "Tractor arrastrador forestal" },
    ],
  },
  {
    label: "Cosecha",
    items: [
      { value: "combine_harvester", label: "Cosechadora" },
      { value: "forage_harvester", label: "Picadora de forraje" },
      { value: "grain_header", label: "Cabezal de cosechadora" },
      { value: "corn_header", label: "Cabezal maicero" },
      { value: "platform_header", label: "Plataforma de cosecha" },
      { value: "cotton_picker", label: "Cosechadora de algodón" },
      { value: "sugarcane_harvester", label: "Cosechadora de caña de azúcar" },
      { value: "potato_harvester", label: "Cosechadora de papas" },
      { value: "vegetable_harvester", label: "Cosechadora de hortalizas" },
      { value: "grape_harvester", label: "Vendimiadora" },
    ],
  },
  {
    label: "Siembra y fertilización",
    items: [
      { value: "planter", label: "Sembradora" },
      { value: "air_seeder", label: "Sembradora neumática" },
      { value: "precision_planter", label: "Sembradora de precisión" },
      { value: "drill", label: "Sembradora de granos finos" },
      { value: "fertilizer_spreader", label: "Fertilizadora" },
      { value: "manure_spreader", label: "Esparcidora de estiércol" },
      { value: "slurry_spreader", label: "Esparcidora de purines" },
      { value: "manure_tanker", label: "Cisterna estercolera" },
    ],
  },
  {
    label: "Pulverización y riego",
    items: [
      { value: "sprayer", label: "Pulverizadora" },
      { value: "self_propelled_sprayer", label: "Pulverizadora autopropulsada" },
      { value: "trailer_sprayer", label: "Pulverizadora de arrastre" },
      { value: "orchard_sprayer", label: "Pulverizadora para frutales" },
      { value: "fumigator", label: "Fumigadora" },
      { value: "irrigation_system", label: "Sistema de riego" },
      { value: "water_tanker", label: "Camión cisterna de agua" },
      { value: "agricultural_drone", label: "Dron agrícola" },
    ],
  },
  {
    label: "Aviación agrícola",
    items: [
      { value: "agricultural_airplane", label: "Avioneta agrícola" },
      { value: "utility_airplane", label: "Avioneta de uso general" },
    ],
  },
  {
    label: "Labranza",
    items: [
      { value: "plow", label: "Arado" },
      { value: "disc_harrow", label: "Rastra de discos" },
      { value: "tine_harrow", label: "Rastra de dientes" },
      { value: "cultivator", label: "Cultivador" },
      { value: "chisel_plow", label: "Cincel" },
      { value: "subsoiler", label: "Subsolador" },
      { value: "roller_crimper", label: "Rolo cuchilla" },
      { value: "land_leveler", label: "Niveladora de terreno" },
      { value: "land_plane", label: "Emparejadora de terreno" },
      { value: "disc_ripper", label: "Rastra descompactadora" },
    ],
  },
  {
    label: "Forraje y heno",
    items: [
      { value: "baler", label: "Enfardadora" },
      { value: "round_baler", label: "Rotoenfardadora" },
      { value: "square_baler", label: "Enfardadora prismática" },
      { value: "mower", label: "Segadora" },
      { value: "disc_mower", label: "Segadora de discos" },
      { value: "conditioner_mower", label: "Segadora acondicionadora" },
      { value: "tedder", label: "Acondicionadora de heno" },
      { value: "hay_rake", label: "Rastrillo hilerador" },
      { value: "forage_wagon", label: "Carro forrajero" },
      { value: "forage_mixer", label: "Mezclador de forraje" },
      { value: "feed_mixer_wagon", label: "Mixer vertical u horizontal" },
    ],
  },
  {
    label: "Granos y poscosecha",
    items: [
      { value: "grain_cart", label: "Tolva autodescargable" },
      { value: "feed_grinder", label: "Molino de granos" },
      { value: "grain_cleaner", label: "Limpiadora de granos" },
      { value: "grain_dryer", label: "Secadora de granos" },
      { value: "grain_elevator", label: "Elevador de granos" },
      { value: "grain_conveyor", label: "Cinta transportadora de granos" },
      { value: "auger", label: "Sinfín de granos" },
    ],
  },
  {
    label: "Transporte",
    items: [
      { value: "grain_trailer", label: "Acoplado granelero" },
      { value: "agricultural_trailer", label: "Remolque agrícola" },
      { value: "livestock_trailer", label: "Remolque para ganado" },
    ],
  },
  {
    label: "Carga y construcción",
    items: [
      { value: "loader", label: "Pala cargadora" },
      { value: "wheel_loader", label: "Cargadora frontal" },
      { value: "backhoe_loader", label: "Retroexcavadora" },
      { value: "excavator", label: "Excavadora" },
      { value: "mini_excavator", label: "Miniexcavadora" },
      { value: "bulldozer", label: "Topadora" },
      { value: "motor_grader", label: "Motoniveladora" },
      { value: "skid_steer", label: "Minicargadora" },
      { value: "telehandler", label: "Manipulador telescópico" },
      { value: "forklift", label: "Autoelevador" },
    ],
  },
  {
    label: "Ganadería y alambrado",
    items: [
      { value: "livestock_feeder", label: "Distribuidor de alimento para ganado" },
      { value: "cattle_crush", label: "Cepo para ganado" },
      { value: "fence_post_driver", label: "Hincapostes" },
      { value: "post_hole_digger", label: "Ahoyadora" },
    ],
  },
  {
    label: "Forestal y desmalezado",
    items: [
      { value: "forestry_harvester", label: "Cosechadora forestal" },
      { value: "forwarder", label: "Autocargador forestal" },
      { value: "wood_chipper", label: "Chipeadora de madera" },
      { value: "stump_grinder", label: "Trituradora de tocones" },
      { value: "mulcher", label: "Trituradora de restos vegetales" },
      { value: "flail_mower", label: "Desmalezadora de martillos" },
      { value: "rotary_cutter", label: "Rotativa" },
      { value: "brush_cutter", label: "Desmalezadora" },
    ],
  },
  {
    label: "Otros",
    items: [{ value: "other", label: "Otra maquinaria" }],
  },
] as const

export type MachineItem = (typeof MACHINE_GROUPS)[number]["items"][number]
export type MachineType = MachineItem["value"]