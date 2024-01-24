// app/Services/ExternalApiService.js
const axios = require('axios');

class ExternalApiService {
  constructor(apiBaseUrl, token) {
    this.apiBaseUrl = apiBaseUrl;
    this.token = token;
    console.log(this.token);
    console.log(this.apiBaseUrl);

  }

async getAllClasses(schoolYear) {
  if (!this.token) {
    throw new Error('Le token d\'accès est manquant. Veuillez vous authentifier d\'abord.');
  }

  const endpoint = '/classes/all';
  const url = `${this.apiBaseUrl}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${this.token}`,
  };

  // Ajouter le paramètre school_year à la requête
  const params = { school_year: schoolYear };

  try {
    const response = await axios.get(url, { headers, params });
    console.log(response.data)
    return response.data;
    
  } catch (error) {
    throw new Error('Erreur lors de la récupération des classes.');
  }
}
async getStudentsInClass(classId, schoolYear) {
  if (!this.token) {
    throw new Error('Le token d\'accès est manquant. Veuillez vous authentifier d\'abord.');
  }

  const endpoint = '/student';
  const url = `${this.apiBaseUrl}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${this.token}`,
    'Accept': 'application/json',
  };

  const params = {
    school_year: schoolYear,
    class_id: classId,
  };

  try {
    const response = await axios.get(url, { headers, params });
   // console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des étudiants de la classe.');
  }
}
  // Ajoutez une méthode à votre service externe
async getClassesByIds(classIds) {
  if (!this.token) {
    throw new Error('Le token d\'accès est manquant. Veuillez vous authentifier d\'abord.');
  }

  const endpoint = '/classes';  // Assurez-vous d'utiliser le bon endpoint
  const url = `${this.apiBaseUrl}${endpoint}`;
  const headers = {
    'Authorization': `Bearer ${this.token}`,
    'Accept': 'application/json',
  };

  const params = {
    class_ids: classIds.join(','),  // Convertir le tableau d'identifiants en une chaîne de texte
  };

  try {
    const response = await axios.get(url, { headers, params });
    return response.data;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des classes.');
  }
}







  async getCourrierById(courrierId) {
    // console.log('thisToken', this.token);
    const endpoint = `/courriers/${courrierId}`;

    const url = `${this.apiBaseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
    };

    try {
      const response = await axios.get(url, { headers });
      // console.log('response', response.data);
      return response.data;

    } catch (error) {
      throw new Error('Erreur lors de la récupération du courrier.');
    }
  }



  async getAllStudents() {
    if (!this.token) {
      throw new Error('Le token d\'accès est manquant. Veuillez vous authentifier d\'abord.');
    }

    const endpoint = '/student';
    const url = `${this.apiBaseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des courriers.');
    }
  }

  async fetchNatureData() {
    try {
      // Récupérer les données pour le champ "nature" depuis l'API
      const natureResponse = await axios.get('https://api-staging.supmanagement.ml/natures');
      return natureResponse.data;
    } catch (error) {
      // Gérer les erreurs lors de la récupération des données depuis l'API
      console.error('Erreur lors de la récupération des données "nature" depuis l\'API :', error);
      // Vous pouvez choisir de gérer l'erreur ici ou la propager vers l'appelant
      throw new Error('Erreur lors de la récupération des données "nature" depuis l\'API');
    }
  }

  async fetchSupportData() {
    try {
      // Récupérer les données pour le champ "support" depuis l'API
      const supportResponse = await axios.get('https://api-staging.supmanagement.ml/supports');
      return supportResponse.data;
    } catch (error) {
      // Gérer les erreurs lors de la récupération des données depuis l'API
      console.error('Erreur lors de la récupération des données "support" depuis l\'API :', error);
      // Vous pouvez choisir de gérer l'erreur ici ou la propager vers l'appelant
      throw new Error('Erreur lors de la récupération des données "support" depuis l\'API');
    }
  }

  async getAllCorrespondants() {
    if (!this.token) {
      throw new Error('Le token d\'accès est manquant. Veuillez vous authentifier d\'abord.');
    }

    const endpoint = '/courriers/correspondants';
    const url = `${this.apiBaseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des courriers.');
    }
  }

  async createCorrespondant(courrierData) {
    console.log("******************************** ----------------------- *********************************************************");
    const endpoint = '/courriers/correspondants';
    const url = `${this.apiBaseUrl}${endpoint}`;

    console.log('URL', url);
    const headers = {
      'Authorization': `Bearer ${this.token}`,
    };
    console.log('COURRIERS DATAS ', courrierData)
    try {
      const response = await axios.post(url, courrierData,{ headers: {
        'Authorization': `Bearer ${this.token}`
      } }, );
      return response.data;
    } catch (error) {
      console.log(error)
      throw new Error('Erreur lors de la création du courrier.');
    }
  }
  async getAllCourriersUsers() {
    if (!this.token) {
      throw new Error('Le token d\'accès est manquant. Veuillez vous authentifier d\'abord.');
    }

    const endpoint = '/courriers/users';
    const url = `${this.apiBaseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
    };

    try {
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      throw new Error('Erreur lors de la récupération des courriers.');
    }
  }
  async getCourrierUserById(courrierId) {
    // console.log('thisToken', this.token);
    const endpoint = `/courriers/users/${courrierId}`;

    const url = `${this.apiBaseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
    };

    try {
      const response = await axios.get(url, { headers });
      // console.log('response', response.data);
      return response.data;

    } catch (error) {
      throw new Error('Erreur lors de la récupération du courrier.');
    }
  }
}

module.exports = ExternalApiService;
