
export const BRAND_LOGOS: { [key: string]: string } = {
  'toyota': 'https://www.car-logos.org/wp-content/uploads/2011/09/toyota.png',
  'honda': 'https://www.car-logos.org/wp-content/uploads/2011/09/honda.png',
  'ford': 'https://www.car-logos.org/wp-content/uploads/2011/09/ford.png',
  'chevrolet': 'https://www.car-logos.org/wp-content/uploads/2011/09/chevrolet.png',
  'chevy': 'https://www.car-logos.org/wp-content/uploads/2011/09/chevrolet.png',
  'volkswagen': 'https://www.car-logos.org/wp-content/uploads/2011/09/volkswagen.png',
  'vw': 'https://www.car-logos.org/wp-content/uploads/2011/09/volkswagen.png',
  'fiat': 'https://www.car-logos.org/wp-content/uploads/2011/09/fiat.png',
  'renault': 'https://www.car-logos.org/wp-content/uploads/2011/09/renault.png',
  'hyundai': 'https://www.car-logos.org/wp-content/uploads/2011/09/hyundai.png',
  'bmw': 'https://www.car-logos.org/wp-content/uploads/2011/09/bmw.png',
  'mercedes': 'https://www.car-logos.org/wp-content/uploads/2011/09/mercedes.png',
  'audi': 'https://www.car-logos.org/wp-content/uploads/2011/09/audi.png',
  'nissan': 'https://www.car-logos.org/wp-content/uploads/2011/09/nissan.png',
  'mitsubishi': 'https://www.car-logos.org/wp-content/uploads/2011/09/mitsubishi.png',
  'jeep': 'https://www.car-logos.org/wp-content/uploads/2011/09/jeep.png',
  'kia': 'https://www.car-logos.org/wp-content/uploads/2011/09/kia.png',
  'peugeot': 'https://www.car-logos.org/wp-content/uploads/2011/09/peugeot.png',
  'citroen': 'https://www.car-logos.org/wp-content/uploads/2011/09/citroen.png',
  'suzuki': 'https://www.car-logos.org/wp-content/uploads/2011/09/suzuki.png',
  'volvo': 'https://www.car-logos.org/wp-content/uploads/2011/09/volvo.png',
  'land rover': 'https://www.car-logos.org/wp-content/uploads/2011/09/land-rover.png',
  'porsche': 'https://www.car-logos.org/wp-content/uploads/2011/09/porsche.png',
  'ferrari': 'https://www.car-logos.org/wp-content/uploads/2011/09/ferrari.png',
  'lamborghini': 'https://www.car-logos.org/wp-content/uploads/2011/09/lamborghini.png',
  'tesla': 'https://www.car-logos.org/wp-content/uploads/2011/09/tesla.png',
  'subaru': 'https://www.car-logos.org/wp-content/uploads/2011/09/subaru.png',
  'mazda': 'https://www.car-logos.org/wp-content/uploads/2011/09/mazda.png',
  'chery': 'https://www.car-logos.org/wp-content/uploads/2011/09/chery.png',
  'jac': 'https://www.car-logos.org/wp-content/uploads/2011/09/jac.png',
  'lifan': 'https://www.car-logos.org/wp-content/uploads/2011/09/lifan.png',
  'byd': 'https://www.car-logos.org/wp-content/uploads/2022/08/byd-logo.png', // Fallback or updated
  'gwm': 'https://www.car-logos.org/wp-content/uploads/2022/08/gwm-logo.png'
};

export const getBrandLogo = (vehicleName: string): string | null => {
  const name = vehicleName.toLowerCase();
  for (const [brand, logo] of Object.entries(BRAND_LOGOS)) {
    if (name.includes(brand)) {
      return logo;
    }
  }
  return null;
};
