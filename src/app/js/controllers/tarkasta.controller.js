'use strict'

angular.module('TarkastaController', [])
  .controller('TarkastaController', [
    '$rootScope', '$scope', '$http', '$state', '$location', '$log', 'APIService', 'KoodistoService',
    function ($rootScope, $scope, $http, $state, $location, $log, APIService, KoodistoService) {
      $scope.meta = APIService.meta;
      $scope.data = [];
      $scope.colOrder = 'id';
      $scope.colOrderReverse = false;
      $scope.totalItems = 0;
      $scope.query = APIService.restoreQuery();
      $scope.loading = {};

      $scope.setPageSize = function (pageSize) {
        $scope.query.pageSize = pageSize;
      };

      $scope.csvExportHeader = [
        'Julkaisun ID',
        'Organisaatiotunnus',
        'Julkaisutyyppi',
        'Julkaisun tila',
        'Julkaisuvuosi',
        'Julkaisun nimi',
        'Julkaisun tekijöiden lukumäärä',
        'Tekijätiedot',
        'Lehden/sarjan nimi',
        'Kustantaja',
        'Julkaisun kustannuspaikka',
        'Julkaisumaa',
        'Julkaisun kieli',
        'Volyymi',
        'Numero',
        'Sivut',
        'Artikkelinumero',
        'ISSN',
        'ISBN',
        'Konferenssin vakiintunut nimi',
        'Emojulkaisun nimi',
        'Emojulkaisun toimittajat',
        'Julkistamispaikkakunta',
        'Tapahtuma',
        'Julkaisun kansainvälisyys',
        'Kansainvälinen yhteisjulkaisu',
        'DOI-tunniste',
        'Pysyvä verkko-osoite',
        'Rinnakkaistallennetun version verkko-osoite',
        'Avoin saatavuus',
        'Avainsanat',
        'Lisätieto',
        'Julkaisun tieteenala 1',
        'Julkaisun tieteenala 2',
        'Julkaisun tieteenala 3',
        'Julkaisun tieteenala 4',
        'Julkaisun tieteenala 5',
        'Julkaisun tieteenala 6',
        'Julkaisun taiteenalat',
        'Taidealan tyyppikategoriat',
        'Organisaation tekijä 1',
        'Alayksikko 1',
        'ORCID 1',
        'Rooli 1',
        'Organisaation tekijä 2',
        'Alayksikkö 2',
        'ORCID 2',
        'Rooli 2'
        // 'Organisaation tekijä 3',
        // 'Alayksikkö 2'
        // 'ORCID 3',
        // Rooli 3',
      ];

      // Hide button from My publications
      $scope.getCsvExportFile = function () {
        $scope.loading.csv = true;
        mapOrganisaatioData();
        mapAlayksikkoData();
        mapTieteenalaData();
        mapTaiteenalaData();
        mapAvainsanat();
        mapTaidelisatietoData();

        return Promise.map($scope.data.julkaisu, function (publication) {
          return {
            'Julkaisun ID': publication.id,
            'Organisaatiotunnus': publication.organisaatiotunnus,
            'Julkaisutyyppi': publication.julkaisutyyppi,
            'Julkaisun tila': publication.julkaisuntila,
            'Julkaisuvuosi': publication.julkaisuvuosi,
            'Julkaisun nimi': publication.julkaisunnimi,
            'Julkaisun tekijöiden lukumäärä': publication.julkaisuntekijoidenlukumaara,
            'Tekijätiedot': publication.tekijat,
            'Lehden/sarjan nimi': publication.lehdenjulkaisusarjannimi,
            'Kustantaja': publication.kustantaja,
            'Julkaisun kustannuspaikka': publication.julkaisunkustannuspaikka,
            'Julkaisumaa': publication.julkaisumaa,
            'Julkaisun kieli': publication.julkaisunkieli,
            'Volyymi': publication.volyymi,
            'Numero': publication.numero,
            'Sivut': publication.sivut,
            'Artikkelinumero': publication.artikkelinumero,
            'ISSN': publication.issn,
            'ISBN': publication.isbn,
            'Konferenssin vakiintunut nimi': publication.konferenssinvakiintunutnimi,
            'Emojulkaisun nimi': publication.emojulkaisunnimi,
            'Emojulkaisun toimittajat': publication.emojulkaisuntoimittajat,
            'Julkistamispaikkakunta': publication.julkistamispaikkakunta,
            'Tapahtuma': publication.tapahtuma,
            'Julkaisun kansainvälisyys': publication.julkaisunkansainvalisyys,
            'Kansainvälinen yhteisjulkaisu': publication.kansainvalinenyhteisjulkaisu,
            'DOI-tunniste': publication.doitunniste,
            'Pysyvä verkko-osoite': publication.pysyvaverkkoosoite,
            'Rinnakkaistallennetun version verkko-osoite': publication.rinnakkaistallennetunversionverkkoosoite,
            'Avoin saatavuus': publication.avoinsaatavuus,
            'Avainsanat': publication.avainsanat,
            'Lisätieto': publication.lisatieto,
            'Julkaisun tieteenala 1': getTieteenala(publication.tieteenala, 1),
            'Julkaisun tieteenala 2': getTieteenala(publication.tieteenala, 2),
            'Julkaisun tieteenala 3': getTieteenala(publication.tieteenala, 3),
            'Julkaisun tieteenala 4': getTieteenala(publication.tieteenala, 4),
            'Julkaisun tieteenala 5': getTieteenala(publication.tieteenala, 5),
            'Julkaisun tieteenala 6': getTieteenala(publication.tieteenala, 6),
            'Julkaisun taiteenalat': getTaiteenalat(publication.taiteenalat),
            'Taidealan tyyppikategoriat': getTyyppikategoriat(publication.taidealantyyppikategoria),
            'Organisaation tekijä 1': getOrganisaatioTekijat(publication.organisaatiotekijat, 1),
            'Alayksikko 1': getAlayksikko(publication.organisaatiotekijat, 1),
            'ORCID 1': getOrcid(publication.orcid, 1),
            'Rooli 1': getRooli(publication.rooli, 1),
            'Organisaation tekijä 2': getOrganisaatioTekijat(publication.organisaatiotekijat, 2),
            'Alayksikkö 2': getAlayksikko(publication.organisaatiotekijat, 2),
            'ORCID 2': getOrcid(publication.orcid, 2),
            'Rooli 2': getRooli(publication.rooli, 2)
            // 'Organisaation tekijä 3',
            // 'Alayksikkö 2'
            // 'ORCID 3',
            // Rooli 3',
          };
        })
          .then(function (data) {
            $scope.loading.csv = false;
            return data;
          });
      };

      let getAlayksikko = function (data, val) {
        if (data === null || typeof data === 'undefined') {
          return;
          } else if (typeof data[val - 1] !== 'undefined') {
            return data[val - 1].alayksikot;
          }
      };

      let getOrganisaatioTekijat = function (data, val) {
        if (typeof data === 'undefined') {
          return;
        } else if (typeof data[val - 1] !== 'undefined') {
          return data[val - 1].etunimet + ',' + data[val - 1].sukunimi;
        } else {
          return;
        }
      };

      let getOrcid = function (data, val) {
        if (typeof data === 'undefined' || data === null) {
          return;
        } else if (typeof data[val - 1] !== 'undefined') {
          return data[val - 1];
        } else {
          return;
        }
      };

      let getTieteenala = function(data, val) {
        if (!data || !data[0]) {
          return;
        } else if (data[val - 1] && data[val - 1].jnro) {
          const tieteenala = $scope.getCode('tieteenalat', data[val - 1].tieteenalakoodi);
          if (!tieteenala) {
            return;
          }
          return tieteenala.arvo + ' ' + tieteenala.selite[$scope.lang];
        } else {
          return;
        }
      };

      let getTaiteenalat = function(data) {
        if (!data) {
          return;
        } else if (data[0]) {
          const taiteenalat = [];
          for (let i = 0; i < data.length; i++) {
            taiteenalat.push(data[i] + ' ' + $scope.getCode('taiteenalat', data[i]).selite[$scope.lang]);
          }
          return taiteenalat.join('; ');
        } else {
          return;
        }
      };

      let getTyyppikategoriat = function(data) {
        if (!data) {
          return;
        } else if (data[0]) {
          const tyyppikategoriat = [];
          for (let i = 0; i < data.length; i++) {
            tyyppikategoriat.push(data[i] + ' ' + $scope.getCode('taidealantyypit', data[i]).selite[$scope.lang]);
          }
          return tyyppikategoriat.join('; ');
        } else {
          return;
        }
      };

      let getRooli = function (data, val) {
        if (typeof data === 'undefined' || data[0] === null) {
          return;
        } else if (typeof data[val - 1] !== 'undefined') {
          let rooli = $scope.getCode('julkaisuntekijanrooli', data[val - 1]);
          return rooli.selite[$scope.lang];
        } else {
          return;
        }
      };

      let mapAlayksikkoData = function () {
        angular.forEach($scope.data.julkaisu, function (ovalue, okey) {
          angular.forEach($scope.alayksikkoData, function (avalue, akey) {
            if (!ovalue.organisaatiotekijat) {
              return;
            }
            if (typeof ovalue.organisaatiotekijat.alayksikot === 'undefined') {
              $scope.data.julkaisu[akey].organisaatiotekijat = [];
            }
            for (let i = 0; i < ovalue.organisaatiotekijat.length; i++) {
              if (ovalue.organisaatiotekijat[i].organisaatiotekijaid.match(avalue.organisaatiotekijaid)) {
                if (typeof ovalue.organisaatiotekijat[i].alayksikot === 'undefined') {
                  ovalue.organisaatiotekijat[i].alayksikot = [];
                }
                ovalue.organisaatiotekijat[i].alayksikot.push(avalue.alayksikko);
              }
            }
          });
        });
      };

      let mapTieteenalaData = function () {
        angular.forEach($scope.data.julkaisu, function (avalue, akey) {
          angular.forEach($scope.tieteenalaData, function (bvalue, bkey) {
            if (avalue.id.match(bvalue.julkaisuid)) {
              if (typeof $scope.data.julkaisu[akey].tieteenala === 'undefined') {
                $scope.data.julkaisu[akey].tieteenala = [];
              }
              $scope.data.julkaisu[akey].tieteenala.push(bvalue);
            }
          });
        });
      };

      let mapTaiteenalaData = function () {
        angular.forEach($scope.data.julkaisu, function (avalue, akey) {
          angular.forEach($scope.taiteenalaData, function (bvalue, bkey) {
            if (avalue.id.match(bvalue.julkaisuid)) {
              if (typeof $scope.data.julkaisu[akey].taiteenalat === 'undefined') {
                $scope.data.julkaisu[akey].taiteenalat = [];
              }
              $scope.data.julkaisu[akey].taiteenalat.push(bvalue.taiteenalakoodi);
            }
          });
        });
      };

      let mapAvainsanat = function () {
        angular.forEach($scope.data.julkaisu, function (avalue, akey) {
          angular.forEach($scope.avainsanaData, function (bvalue, bkey) {
            if (avalue.id.match(bvalue.julkaisuid)) {
              if (typeof $scope.data.julkaisu[akey].avainsanat === 'undefined') {
                $scope.data.julkaisu[akey].avainsanat = [];
              }
              if (bvalue.avainsana || bvalue.avainsana.length !== 0) {
                $scope.data.julkaisu[akey].avainsanat.push(bvalue.avainsana);
              }
            }
          });
        });
      };

      let mapTaidelisatietoData = function () {
        angular.forEach($scope.data.julkaisu, function (avalue, akey) {
          angular.forEach($scope.taidelisatietoData, function (bvalue, bkey) {
            if (avalue.id.match(bvalue.julkaisuid)) {
              if (typeof $scope.data.julkaisu[akey].taidealantyyppikategoria === 'undefined') {
                $scope.data.julkaisu[akey].taidealantyyppikategoria = [];
              }
              if (bvalue.lisatietoteksti || bvalue.lisatietoteksti.length !== 0) {
                if (bvalue.lisatietotyyppi === 'tapahtuma') {
                  $scope.data.julkaisu[akey].tapahtuma = bvalue.lisatietoteksti;
                }
                if (bvalue.lisatietotyyppi === 'julkaisuvuodenlisatieto') {
                  $scope.data.julkaisu[akey].julkaisuvuodenlisatieto = bvalue.lisatietoteksti;
                }
                if (bvalue.lisatietotyyppi === 'julkistamispaikkakunta') {
                  $scope.data.julkaisu[akey].julkistamispaikkakunta = bvalue.lisatietoteksti;
                }
                if (bvalue.lisatietotyyppi === 'taidealantyyppikategoria') {
                  $scope.data.julkaisu[akey].taidealantyyppikategoria.push(bvalue.lisatietoteksti);
                }
              }
            }
          });
        });
      };

      let mapOrganisaatioData = function () {
        angular.forEach($scope.data.julkaisu, function (avalue, akey) {
          angular.forEach($scope.organisaatioData, function (bvalue, bkey) {
            if (avalue.id.match(bvalue.julkaisuid)) {
              if (typeof $scope.data.julkaisu[akey].organisaatiotekijat === 'undefined') {
                $scope.data.julkaisu[akey].organisaatiotekijat = [];
              }
              if (typeof $scope.data.julkaisu[akey].orcid === 'undefined') {
                $scope.data.julkaisu[akey].orcid = [];
              }
              if (typeof $scope.data.julkaisu[akey].rooli === 'undefined') {
                $scope.data.julkaisu[akey].rooli = [];
              }
              $scope.data.julkaisu[akey].organisaatiotekijat.push(
                {
                  'etunimet': bvalue.etunimet,
                  'sukunimi': bvalue.sukunimi,
                  'organisaatiotekijaid': bvalue.id

                });
              $scope.data.julkaisu[akey].orcid.push(bvalue.orcid);
              $scope.data.julkaisu[akey].rooli.push(bvalue.rooli);
            }
          });
        });
      };

      // map from service (generic) to scope
      $scope.getCode = function (codeset, code) {
        return KoodistoService.getCode($scope.codes, codeset, code);
      };

      $scope.updatePublication = function (julkaisu, julkaisuntila) {
        if (julkaisu && julkaisu.id) {
          julkaisu.username = $scope.user.name;
          julkaisu.modified = new Date();
          const julkaisuCopy = angular.copy(julkaisu);
          delete julkaisuCopy.id; // api doesn't like primary key in data
          delete julkaisuCopy.ui_julkaisuntila;
          julkaisuCopy.julkaisuntila = julkaisuntila;
          APIService.put('julkaisu', julkaisu.id, JSON.stringify(julkaisuCopy));
        }
      };

      $scope.usePoista = function (table, id) {
        APIService.delete(table, id);
        // delete from scope
        delete $scope.data[table][id];
      };

      $scope.loadPublications = function () {
        $scope.loading.publications = true;

        // Update current query to url and restore any missing parameters
        $location.search($scope.query);

        $scope.data['julkaisu'] = [];
        // limit fetched rows by organisaatiotunnus
        const val = $scope.user.organization.code !== '00000' ? $scope.user.organization.code : null;
        const col = $scope.user.organization.code !== '00000' ? 'organisaatiotunnus' : null;

        APIService.get('julkaisu', val, col, $scope.query)
          .then(function (obj) {
            // console.log(val);

            $scope.totalItems = obj.totalItems || 0;

            return Promise.map(obj, function (o, k) {
              // NB! API returns '2017-03-24 12:37:47.18+02'
              // => convert string first (as illustrated in http://dygraphs.com/date-formats.html)
              if (o.modified) {
                let m = o.modified;
                m = m.replace(/-/g, '/'); // date separator to '/'
                m = m.replace(/\..*$/, ''); // strip milliseconds away
                o.modified = new Date(m);
              }
              o.ui_julkaisuntila = o.julkaisuntila;
              $scope.data['julkaisu'].push(o);
            });
          })
          .then(function () {
            $scope.loading.publications = false;
          })
          .catch(function (err) {
            $log.error(err);
          });
      };

      $scope.getData = function (val) {
        return APIService.get(val, null, null, $scope.query);
      };

      $scope.resetData = function () {
        $scope.loadPublications();
      };

      let init = function () {
        // at very first test that user object is accessible
        if (!$scope.hasAccess($scope.state.name)) {
          $state.go('index', {lang: $scope.lang});
          // stop initializing
          return;
        }
        $scope.resetData();

        $scope.odottavat = true;

        Promise.all([
          $scope.getData('organisaatiotekija'),
          $scope.getData('alayksikko'),
          $scope.getData('tieteenala'),
          $scope.getData('taiteenala'),
          $scope.getData('avainsana'),
          $scope.getData('lisatieto')
        ])
          .spread((organisaatiotekija, alayksikko, tieteenala, taiteenala, avainsana, lisatieto) => {
            $scope.organisaatioData = organisaatiotekija;
            $scope.alayksikkoData = alayksikko;
            $scope.tieteenalaData = tieteenala;
            $scope.taiteenalaData = taiteenala;
            $scope.avainsanaData = avainsana;
            $scope.taidelisatietoData = lisatieto;
          }).then(() => {
          });
      };

      init();
    }
  ]);
