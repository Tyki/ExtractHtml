/*
Copyright [2014] [PETITDEMANGE Franck]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


//PARAMETRAGE APIEXTRACTION BLOC//

var PDOC = 10;   // PARAMETRE AFFECTANT LA PROFONDEUR DE PARCOURS. VALEUR ORIGINALE A 5 NE DETECTAIT PAS TOUTES LES STRUCTURES
var relativeSizeTreshold = 50;
var relativeSizeTreshold2 = 15;
var rule4Treshold = 21; // Valeur seuil du script d'extraction de F. Petitdemange
var rule9Treshold = 15; // Valeur seuil du script d'extraction de F. Petitdemange
var textLengthTreshold = 30; // Valeur seuil pour le nombre de caractères des noeuds textes, utilisée dans l'annotation


//0 -> parcours normal
//1 -> on n'applique pas la règle 5
var strategy = 0;

/**
 * VisualStruct.user.js
 * @namespace Parametrage
 */


/**/
var  tagSize = {
  "MAIN":3,
  "HEADER":3,
  "SECTION":3,
  "FOOTER":3,
  "NAV":3,
  "FORM" : 3,
  "TABLE" : 3,
  "DIV" : 4,
  "UL" : 2,
  "OL" : 1,
  "TR" : 1,
  "TD": 3,
  "LI" :3,
  "A" : 5,
  "P" : 5,
  "H1" : 5,
  "H2" : 5,
  "H3" : 5,
  "H4" : 5,
  "H5" : 5,
  "H6" : 5,
  "I" : 6,
  "B" : 7,
  "STRONG" : 7,
  "INPUT" : 7,
  "IMG" : 10
};



var inlinetab = {	
	"IMG" : true
}



var contentNode = {	
	"IMG" : true,
	"OBJECT" : true,
	"A" : true
}





/*règle d'application des heuristiques
	spécification de quel règle est applicable sur quelle balise HTML*/






// =========== PARAMETRES DEPRECIES

/*
var seuilDistanceFusion = 5;

var inlinetab = {	
  "H1" : true,
  "H2" : true,
  "H3" : true,
  "H4" : true,
  "H5" : true,
  "H6" : true,
  "UL" : true,
  "LI" : true,
  "P" : false,
  "A" : true,
  "B" : true,
  ,
  "INPUT" : true
}

var virtualNode = {
	"STRONG" : true,
	"BOLT" : true,
	"BIG" : true,
	"EM" : true
}

var descriptionNode = {
	"PARAM" : true,
	"SCRIPT" : true,
	"STYLE" : true,
	"TITLE" : true
}


========== CONDITIONS D'APPLICATION DES HEURISTIQUES DEPRECIEES


function regle1(node){
	return true;
}

function regle2(node){
	if (node.nodeName == "A") return false;
	if (node.nodeName == "IMG") return false;
	if (node.nodeName == "H1") return false;
	if (node.nodeName == "H2") return false;
	if (node.nodeName == "H3") return false;
	if (node.nodeName == "H4") return false;
	if (node.nodeName == "H5") return false;
	if (node.nodeName == "H6") return false;

	return true;

	function regle3(node){
	return true;
}

function regle4(node){
	if (node.nodeName == "TABLE") return false;
	if (node.nodeName == "TR") return false;
	return true;
}

function regle5(node){
	if (node.nodeName == "TABLE") return false;
	if (node.nodeName == "TBODY") return false;
	if (node.nodeName == "TR") return false;
	if (node.nodeName == "TD") return false;
	return true;
}

function regle6(node){
	if (node.nodeName == "TABLE") return false;
	if (node.nodeName == "TR") return false;
	if (node.nodeName == "TD") return false;
	return true;
}

function regle7(node){
	//if (node.nodeName == "DIV") return false;
	if (node.nodeName == "TD") return false;
	if (node.nodeName == "TABLE") return false;
	if (node.nodeName == "TBODY") return false;
	if (node.nodeName == "TR") return false;
	if (node.nodeName == "TD") return false;
	if (node.nodeName == "UL") return false;
	if (node.nodeName == "A") return false;

	return true;
}

function regle8(node){
	if (node.nodeName == "DIV") return true;
	if (node.nodeName == "TABLE") return true;
	if (node.nodeName == "TD") return true;
	if (node.nodeName == "TR") return true;

	return false;
}

function regle9(node){
	if (node.nodeName == "TABLE") return false;
	if (node.nodeName == "TR") return false;

	return true;

}
}
*/