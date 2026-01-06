// pressure version of the BART – CLEAN VERSION FOR SOSCI

$(document).ready(function() { 

    // ================= DEBUG =================
    var urlParams = new URLSearchParams(window.location.search);
    var DEBUG = urlParams.get('debug') === '1';

    // ================= INITIAL VALUES =================
    var round = 0;
    var start_size = 150;
    var increase = 8;
    var size;
    var pumps; 
    var total = 0;

    var rounds_played = 20;
    var maximal_pumps = 30;
    var pumpmeup;

    // ================= DATA =================
    var bart_data = []; // [{round, pumps, exploded, earnings}]

    // ================= LANGUAGE =================
    var label_press = 'Druck in der Zuleitung erhöhen';
    var label_collect = 'Ballon mit Luft aus Zuleitung aufpumpen';
    var label_balance = 'Gesamtguthaben:';
    var label_currency = ' Taler';
    var label_header = 'Ballon-Spiel Runde ';
    var label_gonext1 = 'Nächste Runde starten';
    var label_gonext2 = 'Spiel beenden';

    var msg_1 = '<p>Sie haben in dieser Runde ';
    var msg_explosion2 = ' Mal den Druck erhöht. Der Ballon ist jedoch geplatzt.</p><p>Sie haben in dieser Runde kein Geld verdient.</p>';
    var msg_collect2 = ' Mal den Druck erhöht, ohne dass der Ballon explodiert ist.</p><p>Sie haben ';
    var msg_collect4 = ' Taler Gewinn gemacht. Das erspielte Geld ist sicher in der Bank.</p>';

    // ================= INITIALIZE =================
    $('#press').html(label_press); 
    $('#collect').html(label_collect);
    $('#total_term').html(label_balance);
    $('#total_value').html(total + label_currency);

    // ================= BUTTON STYLE (FIX) =================
    $('#gonext').css({
        'min-width': '220px',
        'padding': '10px 16px',
        'font-size': '16px'
    });

    // ================= NEW ROUND =================
    function new_round() {
        $('#gonext').hide();
        $('#message').hide();  
        $('#collect, #press').show();

        round++;
        size = start_size;
        pumps = 0;

        $('#ballon').width(size).height(size).show();
        $('#round').html('<h2>' + label_header + round + '</h2>');
    }

    // ================= END GAME =================
    function end_game() {

        $('#sliderwrap, #total, #collect, #ballon, #press, #gonext, #round').remove();

        $('#message').html(
            '<h2>Aufgabe beendet</h2><p>Vielen Dank für Ihre Teilnahme.</p>'
        ).show();

        // ===== BART KENNWERTE =====
        var sum_pumps_no_explosion = 0;
        var count_no_explosion = 0;
        var explosion_count = 0;

        bart_data.forEach(function(trial) {
            if (trial.exploded === 0) {
                sum_pumps_no_explosion += trial.pumps;
                count_no_explosion++;
            } else {
                explosion_count++;
            }
        });

        var adjusted_pumps = count_no_explosion > 0
            ? sum_pumps_no_explosion / count_no_explosion
            : 0;

        var explosion_rate = bart_data.length > 0
            ? explosion_count / bart_data.length
            : 0;

        // ===== ÜBERGABE AN SOSCI =====
        window.parent.postMessage({
            type: 'BART_RESULTS',
            adjusted_pumps: adjusted_pumps,
            explosion_rate: explosion_rate
        }, '*');

        if (DEBUG) {
            console.log("BART DATA:", bart_data);
            console.log("Adjusted pumps:", adjusted_pumps);
            console.log("Explosion rate:", explosion_rate);
        }
    }

    // ================= BUTTONS =================
    $('#press').click(function() {
        if (pumps >= 0 && pumps < maximal_pumps) {
            pumps++;
            $("#slider").slider("value", pumps);
        }
    });

    $('#gonext').click(function() {
        if (round < rounds_played) {
            new_round();
        } else {
            end_game();
        }
    });

    $('#collect').click(function() {

        if (pumps === 0) {
            alert('Bitte pumpen Sie mindestens einmal.');
            return;
        }

        $('#collect, #press').hide();

        pumpmeup = pumps;
        pumps = -1;

        var explosion = Math.random() < pumpmeup / maximal_pumps;

        size += pumpmeup * increase;
        $('#slider').slider('value', 0);

        $('#ballon').animate({ width: size, height: size }, 400);

        bart_data.push({
            round: round,
            pumps: pumpmeup,
            exploded: explosion ? 1 : 0,
            earnings: explosion ? 0 : pumpmeup
        });

        if (explosion) {
            setTimeout(() => {
                $('#ballon').hide("explode", { pieces: 48 }, 1000);
                $('#message').html(msg_1 + pumpmeup + msg_explosion2).show();
            }, 400);
        } else {
            total += pumpmeup;
            setTimeout(() => {
                $('#total_value').html(total + label_currency);
                $('#message').html(
                    msg_1 + pumpmeup + msg_collect2 +
                    pumpmeup + msg_collect4
                ).show();
            }, 400);
        }

        // ===== NEXT BUTTON FIX =====
        setTimeout(() => {
            $('#gonext')
                .html(round < rounds_played ? label_gonext1 : label_gonext2)
                .show();
        }, 1200);
    });

    // ================= SLIDER =================
    $("#slider").slider({
        orientation: "vertical",
        min: 0,
        max: 32,
        disabled: true,
        create: function() {
            $(this).find('.ui-slider-handle').text(0);
        },
        change: function(_, ui) {
            $(this).find('.ui-slider-handle').text(ui.value);
        }
    });

    // ================= START =================
    new_round();
});


