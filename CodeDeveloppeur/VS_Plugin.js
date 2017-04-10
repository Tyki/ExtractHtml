/**
 * VS_Plugin
 * @namespace Annotation
 */


this.$ = this.jQuery = jQuery.noConflict(true);

var pageSize = getSize(document.getElementsByTagName('body')[0]);

var paramLevel = 3;

//Ajout Ratios pour position
var ratioTop;
var ratioBottom;
var ratioLeft;
var ratioRight;

//function génération identifiant des noeuds de l'arbre de blocs visuels
var countStruct = 0;
var countPool = 1;
var poolName = "id-VB";

/**
* Lancement de l'extraction et annotation
* @author Franck Petitdemange / Warren Banguet
* @return void
* @memberof Annotation
*/
function main() {
            console.log("LANCEMENT SCRIPT");
              setupRatio();
              /*1- construction arbre bloc visuel */
              var root = document.createElement("root");
              var id = generateId();

              annotation(root, "doc-1");
              annotation(root, id);
              annotation(document.getElementsByTagName('body')[0], id);
              annotation(document.getElementsByTagName('body')[0], "doc-1");

              console.log("debut extraction bloc");
              strategy = 1;
              buildVisualStructTree(document.getElementsByTagName('body')[0], root, 0);
              
              console.log("coucou on lance DAT RECUSION");


              setupRatio();
              processAllCO(root);
              setRemainingSemantics(root);
              console.log("fin extraction bloc");
              
              console.log("---------");

              //drawPool(root, 0, "pink");
              //drawPool(root, 1, "yellow");

              if (paramLevel == 2)
              {
              //console.log("Nombre de structures trouvées (niveau 2) : ",countNodesPerLevel(root, 0, 1));
              //printVisualStructTree(root, 0, 1, " ");       
              }else{
              //drawPool(root, 2, "green");
              //console.log("Nombre de structures trouvées (niveau 3) : ",countNodesPerLevel(root, 0, 2));
              //printVisualStructTree(root, 0, 3, " ");
              }

              console.log("ARRET SCRIPT");

              console.log("---------");

              console.log("Lancement du Plugin");
                 

}




/**
* Fonction générant un nouvel identifiant valide pouvant être associé à un noeud de l'arbre des blocs visuels.
* @author Franck Petitdemange
* @return {String} ret - Identifiant
* @memberof Annotation
*/
function generateId(){
    var ret = poolName+"-"+ countStruct;
    countStruct = countStruct + 1;
    return ret;
}



/**
* Fonction récursive principale réalisant le parcours en profondeur de l'arbre DOM, et remplissant l'arbre des structures visuelles avec les blocs visuels extraits.
* @author Franck Petitdemange
* @param {Node} DOMNode - noeud DOM courant
* @param {Node} VSNode - noeud de l'arbre des Structures Visuelles courant
* @param {int} nLevel - profondeur courante dans l'arbre des Structures Visuelles
* @return void
* @memberof Annotation
*/
function buildVisualStructTree(DOMNode, VSNode, nlevel){

    var extractedPool = [];
    //1-Etape extraction bloc
    DOMNodeDivision(DOMNode, 0, extractedPool);
    //2-Construction arbre
    for (var key in extractedPool)
    {
        var id = generateId();
        var child = extractedPool[key].cloneNode(false); // On clone le noeud du DOM sans ses enfants pour l'ajouter dans l'arbre des Structures Visuelles comme enfant de VSNode
        child.id = id;
        //console.log("noeud " + child.getAttribute("id") + " ajouté comme enfant de " + VSNode.getAttribute("id"));

        annotation(child, getDOC(extractedPool[key]));
        annotation(extractedPool[key], id);
        
        VSNode.appendChild(child);

        //verifie le doc
        
        if (getDOCValue(extractedPool[key]) < PDOC )
            buildVisualStructTree(extractedPool[key], child, nlevel+1);

        strategy = 0;
    }

    
}



/**
 * VS_Debug
 * @namespace Debug
 */


//OUTILS DEBUG






/**
* Fonction d'affichage représentant visuellement sur la page web les Structures Visuelles extraites par le script d'extraction
* @author Franck Petitdemange
* @param {Node} VSNode - Noeud de l'arbre des Structures Visuelles courant.
* @param {Int} level - Niveau courant dans l'Arbre des Structures Visuelles.
* @param {String} color - Couleur choisie pour coloration.
* @return void
* @memberof Debug
*/
function drawPool(VSNode, level, color)
{       
    if (level != 0)
    {
        var child = VSNode.firstChild;
        while (child) 
        {
            drawPool(child, level-1, color)
            child = child.nextSibling;
        }
    }else{
    var child = VSNode.firstChild;
    //console.log("\nnombre de blocs trouvés : "+VSNode.childNodes.length);
        while (child) {
        //console.log("\t",document.getElementsByClassName(child.id)[0]);
        
        //console.log(document.getElementsByClassName(child.id)[0]);
        if(document.getElementsByClassName(child.id)[0]){
        document.getElementsByClassName(child.id)[0].style.background = color;
        document.getElementsByClassName(child.id)[0].style.borderStyle = "solid";
        }
        child = child.nextSibling;
    }
    }
} 



/**
* Fonction d'affichage envoyant sur la console une représentation textuelle de l'arbre des Structures Visuelles allant de la profondeur currentLevel à proofLevel
* @author Franck Petitdemange
* @param {Node} VSNode - noeud courant de l'arbre des Structures Visuelles.
* @param {Int} currentLevel - Profondeur courante dans l'arbre des Structures Visuelles.
* @param {Int} proofLevel - Profondeur maximale de l'arbre à afficher.
* @param {String} indentation - Marqueur d'indentation pour expliciter la profondeur.
* @return void
* @memberof Debug
*/
function printVisualStructTree(VSNode, currentLevel, proofLevel, indentation)
{       
    var child = VSNode.firstChild;

    while (child) {
    console.log(currentLevel, indentation, document.getElementsByClassName(child.id)[0]);

    if (proofLevel != currentLevel)
    {
        printVisualStructTree(child, currentLevel+1, proofLevel, indentation + "++++++");
    }

    child = child.nextSibling;
    }
}

/**
* Fonction comptant le nombre de noeuds dans l'arbre des Structures Visuelles dont la profondeur est comprise entre currentLevel et proofLevel.
* @author Franck Petitdemange
* @param {Node} VSNode - noeud de l'arbre des Structures Visuelles
* @param {Int} currentLevel - niveau courant
* @param {int} proofLevel - profondeur maximale de l'arbre à afficher
* @return {Int} - Nombre de noeuds dont la profondeur est comprise entre currentLevel et proofLevel.
* @memberof Debug
*/
function countNodesPerLevel(VSNode, currentLevel, proofLevel)
{       
    var count = 0;
    var child = VSNode.firstChild;

    while (child) {
    if (proofLevel != currentLevel)
    {
        count = count + countNodesPerLevel(child, currentLevel+1, proofLevel);
    }
    count = count + 1;
    child = child.nextSibling;
    }

    return count;
}

















// ++++++++ FONCTIONS DEPRECIEES

//Test le degres de cohérence du noeud en entrée
//retourne vraie si le noeud est une feuille && il a doc < pdoc

/*function textPdocLeef (node){
    return (getDOCValue(node) < PDOC && node.childNodes.length == 0);
}

function setPoolName(name){
    poolName = name;
    countStruct = 0;
}

function DownPoolLevel(){
    poolName = poolName +"-"+ (countStruct-1) ;
    countStruct = 0;
}

//Parcours l'arbre des blocs visuels extraits
//Retourne les feuilles qui ont un Doc inférieur au pDoc
function checkPdoc(node, pdoc){
    var child = node.firstChild;

    if (child) {
    while (child) {
        //noeud enfant est une feuille
        if (child.firstChild) {
        checkPdoc(child, pdoc);
        }else{
        //noeud enfant est une feuille
        if (getDOCValue(node) < pdoc) {
            return node;
        }else{
            return false;
        }
        }
            child = child.nextSibling;
    }
    }else{
    if (getDOCValue(node) < pdoc) {
        return node;
    }else{
        return false;
    }
    }
}

function parcoursDOM(node, foo){

    var fils = node.childNodes;
    var nbFils = fils.length;

    if (foo(node))  { return node;  }

    for(var i = 0; i < nbFils; i++)
    {
    if (parcoursDOM(fils[i], foo))
    {//si la fonction à trouver un résultat
        return parcoursDOM(fils[i], foo);
    }
    }
}



/*
function printVSTree(VSNode, level){
    var ret = "";

    var child = VSNode.firstChild;
    while (child) {
    ret = ret + "\n"+printEspace(level) +child.nodeName + child.className;
    
    if (child.firstChild) {
        ret = printEspace(level) + ret;
        ret = ret + printVSTree(child, level + 1);
    }
    
        child = child.nextSibling;
    }
    return ret;
}


/*
function printpool(pool, msg){
    console.log("<"+msg+">");
    for (key in pool){
        console.log(pool[key].print());
    }
    console.log("</"+msg+">");
}


 /*
function printnodes(pool, msg){
    console.log("<"+msg+">");
    for (var key in pool) {
    console.log(pool[key]);
        console.log("   "+printNode(pool[key]));
    }
    console.log("<"+msg+">");
}


 /*
function printEspace(nbEspace){
    var ret = "";
    for (i=0; i<nbEspace; i++){
    ret = "_ " + ret;
    }
    return ret;
}


 /*
function deletionPoolSep(pool){
    for (var key2 in pool ){
        pool[key2].deletion();
    }
} 


/**
* Fonction dépréciée affichant 
* @author Franck Petitdemange
* @param {List<Node>} pool - ensemble de Noeuds
* @return void
* @memberof Debug
*/ /*
function drawPool(pool){
    for (var key2 in pool ){
        pool[key2].dessiner();
    }
}


 /*
function getPool(VSNode, level, pool)
{   
    if (level != 0)
    {
    var child = VSNode.firstChild;
        while (child) {
        getPool(child, level-1, pool)
        child = child.nextSibling;
    }
    }else{
    var child = VSNode.firstChild;
        while (child) {
        /*traitement*/ /*
        pool.push(child);
        child = child.nextSibling;
    }
    }
} 

 /*
function dessinerPoolref(pool){
    for (var key2 in pool ){
        pool[key2].style.background = "green";
        pool[key2].style.borderStyle = "solid";
    }
}


*/