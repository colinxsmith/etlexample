var optObj = require('./build/Release/OPT'); //javascript interface for safeqp.dll
var datObj = require('./readFile.js'); //javascript interface for my file parser
console.log(optObj.CvarOptimiseCR.toString());
var optEtl = (inputs) => {
    var eps = Math.abs((4 / 3 - 1) * 3 - 1); //machine accuracy
    var firstRun = false;
    var DATA = Array(datObj.hist.length);
    for (let i = 0; i < datObj.hist.length; ++i) {
        DATA[i] = -datObj.hist[i];
    }
    var n = datObj.n;
    var t = datObj.tlen;
    var number_included = Math.floor(t * 0.95);
    var CVar_averse = 1;
    var getRisk = -1;
    var stocknames = datObj.names;
    var w_opt = Array(n);
    var m = 1;
    var A = Array(m * n);
    var L = Array(n + m);
    var U = Array(n + m);
    var alpha = [];
    var benchmark = [];
    var Q = [];
    var gamma = 0;
    var initial = [];
    var delta = -1;
    var basket = -1;
    var trades = -1;
    var revise = 0;
    var min_holding = [];
    var min_trade = [];
    var ls = 0;
    var full = 0;
    var Rmin = -1;
    var Rmax = -1;
    var log = 2;
    var round = 0;
    var min_lot = [];
    var size_lot = [];
    var shake = Array(n);
    var LSValue = 1;
    var nabs = 0;
    var Abs_A = [];
    var mabs = 0;
    var I_A = 0;
    var Abs_U = [];
    var ogamma = Array(1);
    var mask = [];
    var logfile = 'Etl.log';
    var longbasket = -1;
    var shortbasket = -1;
    var LSValuel = 0;
    var Abs_L = [];
    var costs = 0;
    var buy = [];
    var sell = [];
    var CVar_constraint = 0;
    var CVarMin = -1.593e-05;
    var CVarMax = -1.592e-05;
    var relEtl = false;
    if (inputs.CVar_constraint !== undefined) {
        CVar_constraint = inputs.CVar_constraint;
    }
    if (inputs.CVarMax !== undefined) {
        CVarMax = inputs.CVarMax;
    }
    if (inputs.CVarMin !== undefined) {
        CVarMin = inputs.CVarMin;
    }
    if (inputs.relEtl === undefined) {
        relEtl = inputs.relEtl = true;
    } else {
        relEtl = inputs.relEtl;
    }
    if (inputs.lower === undefined || inputs.lower.length === 0) {
        firstRun = true;
        inputs.lower = Array(n);
        for (let i = 0; i < n; ++i) {
            inputs.lower[i] = 0;
        }
    }
    if (inputs.upper === undefined || inputs.upper.length === 0) {
        inputs.upper = Array(n);
        for (let i = 0; i < n; ++i) {
            inputs.upper[i] = 1;
        }
    }
    if (inputs.alpha === undefined || inputs.alpha.length < n) {
        if (relEtl) {
            inputs.gamma = gamma = 0.99;
        }
        alpha = [];
    } else {
        alpha = Array(n);
        for (let i = 0; i < n; ++i) {
            alpha[i] = inputs.alpha[i];
        }
    }
    if (inputs.CVar_averse === undefined) {
        inputs.CVar_averse = CVar_averse;
    }
    if (inputs.gamma === undefined) {
        inputs.gamma = gamma;
    }
    if (inputs.delta === undefined) {
        inputs.delta = delta;
    }
    if (inputs.revise === undefined) {
        inputs.revise = revise;
    }
    if (inputs.costs === undefined) {
        inputs.costs = costs;
    }
    if (inputs.initial === undefined || inputs.initial.length < n) {
        initial = Array(n);
        var sum = 0;
        for (let i = 0; i < n; ++i) {
            initial[i] = i < 60 ? i + 1 : 0;
            sum += initial[i];
        }
        for (let i = 0; i < n; ++i) {
            initial[i] /= sum;
        }
    } else {
        initial = Array(n);
        for (let i = 0; i < n; ++i) {
            initial[i] = inputs.initial[i];
        }
    }
    if (inputs.buy === undefined || inputs.buy.length < n) {
        buy = Array(n);
        for (let i = 0; i < n; ++i) {
            buy[i] = 0;
        }
    } else {
        buy = Array(n);
        for (let i = 0; i < n; ++i) {
            buy[i] = inputs.buy[i];
        }
    }
    if (inputs.sell === undefined || inputs.sell.length < n) {
        sell = Array(n);
        for (let i = 0; i < n; ++i) {
            sell[i] = 0;
        }
    } else {
        sell = Array(n);
        for (let i = 0; i < n; ++i) {
            sell[i] = inputs.sell[i];
        }
    }
    if (inputs.basket != undefined && inputs.basket > -1) {
        basket = inputs.basket;
    }
    if (inputs.trades != undefined && inputs.trades > -1) {
        trades = inputs.trades;
    }
    if (inputs.min_holding != undefined && inputs.min_holding > -1) {
        min_holding = Array(n);
        for (let i = 0; i < n; ++i) {
            min_holding[i] = inputs.min_holding;
        }
    }
    if (inputs.min_trade != undefined && inputs.min_trade > -1) {
        min_trade = Array(n);
        for (let i = 0; i < n; ++i) {
            min_trade[i] = inputs.min_trade;
        }
    }
    assets = Array(n);
    for (let i = 0; i < n; ++i) {
        assets[i] = `stock${i + 1}`;
        A[i] = 1;
        L[i] = inputs.lower[i];
        U[i] = inputs.upper[i];
    }
    L[n] = 1;
    U[n] = 1;
    var noRiskModel = true; // Use zero risk model so that first optimisation is just CVAR
    var QQ;
    CVar_averse = inputs.CVar_averse;
    if (inputs.noRiskModel === undefined) {
        inputs.noRiskModel = noRiskModel;
    }

    noRiskModel = true; // Never use a risk model
    if (noRiskModel) {
        QQ = Array(n * (n + 1) / 2);
        for (let i = 0; i < n * (n + 1) / 2; ++i) {
            QQ[i] = 0;
        }
    }
    gamma = inputs.gamma;
    delta = inputs.delta;
    revise = inputs.revise;
    costs = inputs.costs;
    var initialCvarVal = optObj.CVarValue(n, t, DATA, number_included, initial);
    if (relEtl) {
        console.log('Get relative data returns');
        for (let j = 0; j < t; ++j) {
            var relret = 0;
            for (let i = 0; i < n; ++i) {
                relret += +DATA[j + i * t] * initial[i];
            }
            for (let i = 0; i < n; ++i) {
                DATA[j + t * i] -= relret;
            }
        }
    }
    /*    if (gamma < eps && CVar_constraint === 1) {
            gamma = 1;
        }*/
    var back;
    // First time just report ETL for the initial portfolio
    if (!firstRun) {
        back = optObj.CvarOptimiseCR(n, t, DATA, number_included, CVar_averse, getRisk, stocknames, w_opt, m,
            A, L, U, alpha, benchmark, noRiskModel ? QQ : Q, gamma, initial, delta, basket, trades, revise, min_holding, min_trade,
            ls, full, Rmin, Rmax, round, min_lot, size_lot, shake, LSValue, nabs, Abs_A, mabs, I_A, Abs_U, ogamma,
            mask, log, logfile, longbasket, shortbasket, LSValuel, Abs_L, costs, buy, sell, CVar_constraint, CVarMin, CVarMax, 0);
    } else {
        for (let i = 0; i < n; ++i) {
            w_opt[i] = initial[i];
        }
    }

    exports.initial = initial;
    exports.buy = buy;
    exports.sell = sell;
    exports.lower = inputs.lower;
    exports.upper = inputs.upper;
    exports.weights = w_opt;
    exports.names = stocknames;
    exports.gamma = gamma;
    exports.relEtl = relEtl;

    if (!firstRun) {
        console.log(optObj.Return_Message(back));
    }
    var returns = Array(n),
        decay = Array(t);
    for (let i = 0; i < t; ++i) {
        decay[i] = 1;
    }
    if (inputs.alpha === undefined || inputs.alpha.length < n) {
        for (let i = 0; i < n; ++i) {
            var internal = DATA.slice(i * t, (i + 1) * t);
            returns[i] = 0;
            for (let j = 0; j < t; ++j) {
                returns[i] += +internal[j];
            }
            returns[i] /= -t;
        }
        exports.alpha = returns;
    } else {
        exports.alpha = alpha;
    }
    var expReturn = optObj.ddotvec(n, w_opt, inputs.alpha === undefined || inputs.alpha.length < n ? returns : alpha);
    console.log('Historic return', expReturn);
    //Very slow doing the risk in javascript
    /*    var COV = Array(n * (n + 1) / 2);
        for (let i = 0, ij = 0; i < n; ++i) {
            var internali = DATA.slice(i * t, (i + 1) * t);
            for (let j = 0; j <= i; j++, ij++) {
                if (i === j) {
                    COV[ij] = optObj.covariance1(internali, internali, decay, t);
                } else {
                    var internalj = DATA.slice(j * t, (j + 1) * t);
                    COV[ij] = optObj.covariance1(internali, internalj, decay, t);
                }
            }
        }
        var implied = Array(n);
        optObj.Sym_mult(n, COV, w_opt, implied);
        var variance = optObj.ddotvec(n, w_opt, implied);
        console.log('variance', variance);
        if (variance < 0) {
            variance = 0;
        }
        var histRisk = Math.sqrt(variance);
        console.log('Historic risk', histRisk);*/
    var cvarVal = firstRun ? initialCvarVal : optObj.CVarValue(n, t, DATA, number_included, w_opt);
    console.log('Etl', cvarVal);
    exports.CVAR = cvarVal;
    //    exports.RISK = histRisk;
    exports.RETURN = expReturn;
    exports.message = firstRun ? '' : optObj.Return_Message(back);
}

exports.optEtl = optEtl;