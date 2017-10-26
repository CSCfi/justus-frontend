'use strict';

angular.module('JustusController', [])
.controller('JustusController', [
  '$rootScope', '$scope', '$log', '$http', '$state', '$stateParams', 'CrossRefService', 'VIRTAService',
  'JUFOService', 'FintoService', 'KoodistoService', 'JustusService', 'APIService', 'ValidationService',
  function($rootScope, $scope, $log, $http, $state, $stateParams, CrossRefService, VIRTAService,
  JUFOService, FintoService, KoodistoService, JustusService, APIService, ValidationService) {
    $scope.loading = {};
    $scope.meta = APIService.meta;
    $scope.justus = JustusService.getPublicationFormData();
    $scope.pattern = JustusService.pattern;

    $scope.tekijatTags = [];
    $scope.avainsanatTags = [];
    $scope.lehtinimet = [];
    $scope.kustantajanimet = [];
    $scope.konferenssinimet = [];
    $scope.julkaisunnimet = [];
    $scope.julkaisu = {};

    $scope.crossrefLataa = false;
    $scope.virtaLataa = false;
    $scope.requiredHighlight = false;
    $scope.invalidFields = [];

    // Parses first- and lastnames from a string of names and returns them in a list of objects [{ firstName: '', lastName: '' }, ...]
    const parseNames = function(namesString) {
      const parsedNames = [];
      if (namesString && namesString.length > 0) {
        const namePairs = namesString.split(';');

        namePairs.map(function(namePair) {
          const splittedNames = namePair.split(',');
          parsedNames.push({
            lastName: splittedNames[0] ? splittedNames[0].trim() : '',
            firstName: splittedNames[1] ? splittedNames[1].trim() : ''
          });
        });
      }

      return parsedNames;
    };

    $scope.clearFormAndReturnToStart = function() {
      JustusService.clearPublicationForm();
      $scope.justus = JustusService.getPublicationFormData();
      $scope.julkaisutyyppi = null;
      $scope.julkaisutyyppi_paa = null;
      $scope.tekijatTags = [];
      $scope.avainsanatTags = [];
      $scope.lehtinimet = [];
      $scope.kustantajanimet = [];
      $scope.konferenssinimet = [];
      $scope.julkaisunnimet = [];
      $scope.julkaisu = {};
      $scope.crossrefLataa = false;
      $scope.virtaLataa = false;
      $scope.requiredHighlight = false;
      $scope.invalidFields = [];
      $scope.useVaihe(1);
    };

    $scope.useTekijat = function() {
      // Add space after each comma if none entered
      $scope.tekijatTags = $scope.tekijatTags.map(function(tag, index) {
        if (tag.text && tag.text.indexOf(', ') === -1) {
          tag.text = tag.text.replace(',', ', ');
        }
        return tag;
      });

      $scope.justus.tekijat = '';
      $scope.justus.tekijat = $scope.tekijatTags.map(function(tag, index) {
        return tag.text;
      }).join('; ');
      $scope.justus.julkaisuntekijoidenlukumaara = $scope.tekijatTags.length;
    };

    $scope.useKopioiTekijat = function(input) {
      var tempstr = input;
      for (var i = 0; i < $scope.justus.julkaisuntekijoidenlukumaara; i++) {
        var sb = 0;
        var se = tempstr.indexOf(',');
        var eb = tempstr.indexOf(',') + 1;
        var ee = tempstr.indexOf(';') >= 0 ? tempstr.indexOf(';') : tempstr.length;
        $scope.justus.organisaatiotekija[i] = {};
        $scope.justus.organisaatiotekija[i].sukunimi = tempstr.substring(sb, se).trim();
        $scope.justus.organisaatiotekija[i].etunimet = tempstr.substring(eb, ee).trim();
        $scope.justus.organisaatiotekija[i].alayksikko = [''];
        tempstr = tempstr.substring(ee + 1);
      }
    };

    $scope.useOrganisaatiotekijaAlayksikko = function(parIndex, index, input) {
      $scope.justus.organisaatiotekija[parIndex].alayksikko[index] = {};
      $scope.justus.organisaatiotekija[parIndex].alayksikko[index].alayksikko = input;
    };

    $scope.useJulkaisutyyppiPaa = function(input) {
      if (!input) return;
      $scope.julkaisutyyppi_paa = input;
    };

    $scope.refreshKanavanimet = function(tyyppi, input) {
      if (tyyppi == null) return;
      if (input == null) return;
      if (input.length < 5) return [];
      return JUFOService.etsikanava(input, tyyppi)
      .then(function (response) {
        if (angular.isArray(response.data)) {
          if (tyyppi === 3) $scope.konferenssinimet = response.data;
          if (tyyppi === 2) $scope.kustantajanimet = response.data;
          if (tyyppi === 1) $scope.lehtinimet = response.data;
          return response.data;
        }
      });
    };

    $scope.useLehtisarja = function(input) { // jufo_id
      if (input === null) return;
      JUFOService.kanava(input)
      .then(function (obj) {
        $scope.justus.lehdenjulkaisusarjannimi = obj.Name;
        $scope.justus.jufotunnus = input; // tai vastauksesta...
        $scope.justus.jufoluokitus = obj.Level;
        if (obj.ISSN1) $scope.justus.issn = obj.ISSN1;
        if ($scope.justus.issn === null || $scope.justus.issn === '') {
          if (obj.ISSN2) $scope.justus.issn = obj.ISSN2;
        }
        if (obj.Publisher) {
          $scope.justus.kustantaja = obj.Publisher
            // 'html unescape'
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');
        }
      });
    };

    $scope.fetchLehtisarja = function(input) { // issn
      if (input == null) return;
      JUFOService.etsiissn(input)
      .then(function (response) {
        var jobj = response.data;
        var jufotunnus = jobj && jobj.length > 0 ? jobj[0].Jufo_ID : null; // voisi asettaa jo scopeen, mutta seuraavassa kutsussa
        $scope.useLehtisarja(jufotunnus); // vain issn?
        $scope.lehtinimet.selected = jobj && jobj.length > 0 ? jobj[0] : null;
      });
    };

    $scope.refreshJulkaisunnimet = function(input, tekija) {
      if (input === null) return;
      if (input.length < 3) return;

      $scope.julkaisunnimet = [];
      // CrossRef :: haku julkaisun nimellä, mutta voi olla myös tekijän nimi
      $scope.crossrefLataa = true;
      CrossRefService.worksquery(input, tekija)
      .then(function(obj) {
        $scope.julkaisunnimet = $scope.julkaisunnimet.concat(obj);
        $scope.crossrefLataa = false;
      });

      // VIRTA :: haku julkaisun nimellä, mutta voi olla myös tekijän nimi
      $scope.virtaLataa = true;
      VIRTAService.fetch(input, tekija)
      .then(function (obj) {
        $scope.julkaisunnimet = $scope.julkaisunnimet.concat(obj);
        $scope.virtaLataa = false;
      });
    };

    $scope.useJulkaisunnimi = function(source, input) { // input == identifier
      if (!source || !input) return;

      if (source === 'CrossRef') {
        $scope.crossrefLataa = true;
        CrossRefService.works(input)
        .then(function successCb(response) {
          angular.forEach(response.data, function(robj, rkey) {
            $scope.justus.doitunniste = input;
            if (robj.title) {
              if (typeof robj.title === 'object' && robj.title.length > 0) {
                $scope.justus.julkaisunnimi = robj.title[0];
              }
              else {
                $scope.justus.julkaisunnimi = robj.title;
              }
            }
            if (robj.ISSN) {
              if (typeof robj.ISSN === 'object' && robj.ISSN.length > 0) {
                $scope.justus.issn = robj.ISSN[0];
              }
              else {
                $scope.justus.issn = robj.ISSN;
              }
            }
            $scope.justus.volyymi = robj.volume || '';
            $scope.justus.numero = robj.issue || '';
            $scope.justus.sivut = robj.page || '';
            if (robj['article-number']) {
              $scope.justus.artikkelinumero = robj['article-number'];
            }

            var s = '';
            angular.forEach(robj.author, function(aobj, akey) {
              if (s.length > 0) s += '; ';
              s += aobj.family + ', ' + aobj.given;
            });
            $scope.justus.tekijat = s;

            // Initialize tekijatTags input
            parseNames($scope.justus.tekijat).map(function(nameObject) {
              $scope.tekijatTags.push({ text: `${nameObject.lastName}, ${nameObject.firstName}` });
            });
            $scope.useTekijat();
            if (robj.issued) {
              if (robj.issued['date-parts']) {
                s = '' + robj.issued['date-parts'];
                $scope.justus.julkaisuvuosi = s.split(',')[0];
              }
            }
            $scope.fetchLehtisarja($scope.justus.issn);
            $scope.julkaisuhaettu = true;
          });
          $scope.crossrefLataa = false;
          $scope.useVaihe(3); // ->tietojen syöttöön
        }, function errorCb(response) {
          $scope.julkaisuhaettu = false;
          return false;
        });
      }
      // Prefill publication from VIRTA
      if (source === 'VIRTA') {
        $scope.virtaLataa = true;
        VIRTAService.get(input)
        .then(function successCb(response) {
          let robj = response.data;
          //  loop VIRTA services fields mapped to justus
          angular.forEach(VIRTAService.fields, function(virta, justusFieldKey) {
            if ((robj[virta.get] !== null || robj[virta.get] !== undefined) && justusFieldKey !== 'julkaisuntila') {
              $scope.useField(justusFieldKey, robj[virta.get]);
            }
          });

          $scope.fetchLehtisarja($scope.justus.issn);
          // Initialize tekijatTags input
          parseNames($scope.justus.tekijat).map(function(nameObject) {
            $scope.tekijatTags.push({ text: `${nameObject.lastName}, ${nameObject.firstName}` });
          });
          $scope.useTekijat();

          let o = [];
          if (robj['Tekijat']) {
            if (robj.Tekijat['Tekija']) {
              let tmp = [];
              if (angular.isArray(robj.Tekijat.Tekija)) {
                tmp = robj.Tekijat.Tekija;
              }
              else {
                tmp.push(robj.Tekijat.Tekija);
              }
              angular.forEach(tmp, function(aobj, akey) {
                let a = [];
                if (aobj.Yksikot) {
                  if (angular.isArray(aobj.Yksikot)) {
                    angular.forEach(aobj.Yksikot, function(yobj, ykey) {
                      a.push({ alayksikko: yobj.YksikkoKoodi });
                    });
                  }
                  else {
                    a.push({ alayksikko: aobj.Yksikot.YksikkoKoodi });
                  }
                }
                o.push({
                  'sukunimi': aobj.Sukunimi,
                  'etunimet': aobj.Etunimet,
                  'orcid': null,
                  'alayksikko': a
                });
              });
            }
          }
          $scope.justus.organisaatiotekija = o;

          // $scope.justus.tieteenala = [{tieteenalakoodi:'', jnro:null}];
          let t = [];
          if (robj['TieteenalaKoodit']) {
            if (robj.TieteenalaKoodit['TieteenalaKoodi']) {
              let tmp = [];
              if (angular.isArray(robj.TieteenalaKoodit.TieteenalaKoodi)) {
                tmp = robj.TieteenalaKoodit.TieteenalaKoodi;
              }
              else {
                tmp.push(robj.TieteenalaKoodit.TieteenalaKoodi);
              }
              angular.forEach(tmp, function(tobj, tkey) {
                t.push({ 'tieteenalakoodi': '' + tobj.content, 'jnro': '' + tobj.JNro });
              });
            }
          }
          $scope.justus.tieteenala = t;

          // missing lists?
          fillMissingJustusLists();

          $scope.julkaisuhaettu = true;

          $scope.virtaLataa = false;
          $scope.useVaihe(3); // ->tietojen syöttöön
        }, function errorCb(response) {
          $log.debug('useJulkaisunnimi ' + source + ' ' + input + ' ei löytynyt!');
          $scope.julkaisuhaettu = false;
          return false;
        });
      }

      $scope.initializeAvainsanatTags();
    };

    $scope.refreshAvainsanat = function(input) {
      if (input === null) return;
      if (input.length < 3) return [{ prefLabel: input, localname: input }];
      return FintoService.search($scope.lang, input)
      .then(function(tags) {
        $scope.avainsanatLataa = false;
        if (!tags || tags.length === 0) {
          return [{ prefLabel: input, localname: input }];
        }
        return tags;
      })
      .catch(function() {
        $log.debug('refreshAvainsanat ' + input + ' ei löytynyt!');
        $scope.avainsanatLataa = false;
        return [{ prefLabel: input, localname: input }];
      });
    };

    $scope.addAvainsana = (tag) => {
      $scope.justus.avainsana.push({
        avainsana: tag.prefLabel ? tag.prefLabel : tag
      });
    };

    $scope.removeAvainsana = function() {
      $scope.justus.avainsana = [];
      $scope.justus.avainsana = $scope.avainsanatTags.map(function(tag) {
        return { avainsana: tag.prefLabel };
      });
    };

    $scope.initializeAvainsanatTags = function() {
      if ($scope.justus.avainsana) {
        $scope.justus.avainsana.map(function(keywordObject) {
          if (keywordObject.avainsana.length > 0) {
            $scope.avainsanatTags.push({ prefLabel: keywordObject.avainsana });
          }
        });
      }
    };

    $scope.useTieteenala = function(input) {
      if (input === null) return;
      if (!$scope.justus.tieteenala) {
        $scope.justus.tieteenala = [];
      }

      // Selecting päätieteenala, filter alatieteenala input options
      if (input.length === 1) {
        $scope.tieteenala_paa = input;
        $scope.alatieteenalat = $scope.getCode('tieteenalat', input).alatyypit;
      }
      // Otherwise selecting alatieteenala, add if not already found
      else if (!$scope.justus.tieteenala.find(function(item) {
        return item.tieteenalakoodi === input;
      })) {
        $scope.justus.tieteenala.push({
          tieteenalakoodi: input,
          jnro: $scope.justus.tieteenala.length
        });
      }
    };

    $scope.useVaihe = function(vaihe) {
      // Prevent user from navigating to vaihe 1 when editing a publication
      if ($scope.justus.id && vaihe === 1) {
        return;
      }

      $scope.vaihe = vaihe;
      if ($scope.justus.julkaisutyyppi && $scope.justus.julkaisutyyppi.length > 1) {
        // make sure both values are set (paa,ala):
        $scope.useJulkaisutyyppiPaa($scope.justus.julkaisutyyppi.substring(0, 1));
        // Stay on stage 3 if stage form not valid
        if ($scope.vaihe === 4) {
          if (!$scope.isJustusValid()) {
            $scope.useVaihe(3);
            return;
          }
          // Add user's organisaatiotunnus to the form
          this.justus.organisaatiotunnus = domain_organization[$rootScope.user.domain].code;
        }
      }
      else {
        // ei julkaisutyyppiä ja vaihe jotain liikaa, siirrytään valitsemaan:
        if ($scope.vaihe > 2) {
          // TO-DO? näytä jokin message!? (sivun ulkoasu kyllä muuttuu jo, mutta miksi...)
          $scope.useVaihe(2);
          return;
        }
      }
      // messes up initialization even though brings history to use...: $state.go('justus', {lang:$scope.lang,id:$scope.justus.id,vaihe:vaihe});
    };

    $scope.useRequiredHighlight = function() {
      $scope.requiredHighlight = !$scope.requiredHighlight;
    };

    $scope.useField = function(field, input) {
      if (input !== null && input !== undefined) {
        $scope.justus[field] = String(input);
      }
    };

    // map from service (generic) to scope
    $scope.getCode = function(codeset, code) {
      return KoodistoService.getCode($scope.codes, codeset, code);
    };

    $scope.isFieldVisible = function(field) {
      return JustusService.isFieldVisible(field);
    };

    $scope.isFieldRequired = function(field) {
      return JustusService.isFieldRequired(field);
    };

    $scope.isValid = function(field) {
      return JustusService.isValid(field);
    };

    $scope.isJustusValid = function() {
      $scope.invalidFields = JustusService.getInvalidFields();
      ValidationService.setValidationErrors($scope.invalidFields);
      return $scope.invalidFields.length === 0;
    };

    $scope.isFieldRequired = function(fieldName) {
      return JustusService.isFieldRequired(fieldName);
    };

    // fillMissingJustusLists - for UI setup list fields if otherwise missing
    // - internal unscoped function
    // - parameter input is optional
    let fillMissingJustusLists = function() {
      if (!$scope.justus.avainsana) {
        $scope.justus.avainsana = [{ avainsana: '' }];
      }
      if (!$scope.justus.tieteenala) {
        $scope.justus.tieteenala = [];
      }
      if (!$scope.justus.organisaatiotekija) {
        $scope.justus.organisaatiotekija = [{
          alayksikko: [{ alayksikko: '' }]
        }];
      }
    };

    let populatePublicationData = () => {
      if (!$stateParams.id) {
        finalizeInit();
        return;
      }

      $scope.loading.publication = true;
      let organisaatiotekijaPopulated = [];

      Promise.all([
        APIService.get('julkaisu', $stateParams.id, null, null, true),
        APIService.get('avainsana', $stateParams.id, 'julkaisuid'),
        APIService.get('tieteenala', $stateParams.id, 'julkaisuid'),
        APIService.get('organisaatiotekija', $stateParams.id, 'julkaisuid')
      ])
      .spread((julkaisu, avainsana, tieteenala, organisaatiotekijat) => {
        $scope.justus = julkaisu;
        
        parseNames($scope.justus.tekijat).map(function(nameObject) {
          $scope.tekijatTags.push({ text: `${nameObject.lastName}, ${nameObject.firstName}` });
        });
        $scope.useTekijat();
        
        $scope.justus.avainsana = avainsana;
        $scope.justus.tieteenala = tieteenala;
      
        return Promise.map(organisaatiotekijat, (organisaatiotekija) => {
          return APIService.get('alayksikko', organisaatiotekija.id, 'organisaatiotekijaid')
          .then((alayksikko) => {
            organisaatiotekija.alayksikko = alayksikko || [{ alayksikko: '' }];
            return organisaatiotekijaPopulated.push(organisaatiotekija);
          });
        })
      })
      .then(() => {
        $scope.justus.organisaatiotekija = organisaatiotekijaPopulated || [{}];
        $scope.loading.publication = false;
        finalizeInit();
      })
      .catch((err) => {
        $log.error(err);
        $scope.loading.publication = false;
      });
    };

    let finalizeInit = () => {
        $scope.justus.username = $rootScope.user.name;
        fillMissingJustusLists();
        JustusService.updatePublicationFormData($scope.justus);
        $scope.useVaihe($stateParams.vaihe || 1);
    };

    populatePublicationData();
  }
]);
