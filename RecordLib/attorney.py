from dataclasses import dataclass



@dataclass
class Attorney:
    organization: str
    name: str
    organization_address: str
    organization_phone: str
    bar_id: str 
    