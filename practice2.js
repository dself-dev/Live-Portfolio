// ok so this waits for the page to load first so i dont grab stuff before it exists
document.addEventListener('DOMContentLoaded', function () {
    // grab all the row buttons (im actually using them as column buttons lol)
    const rowButtons = document.querySelectorAll('.row-buttons .row-btn');

    // i want to count total times the player picked their column (needs 3 rounds for the trick)
    let rounds = 0;

    // helper: read the board as a 7x7 array of numbers (strings actually)
    function readBoard() {
        const arr = [];
        for (let i = 1; i <= 49; i++) {
            const el = document.querySelector(`#card-${i}`);
            arr.push(el ? el.textContent : "");
        }
        // make it 7 rows of 7 columns any more it seemed as thought the page get congested, 10 rows with nums and pics or //letters woyuld be great but same principle just less rows
        const grid = [];
        for (let r = 0; r < 7; r++) {
            grid.push(arr.slice(r * 7, r * 7 + 7));
        }
        return grid; // grid[row][col]
    }

    // helper: write a 7x7 grid back to the board
    function writeBoard(grid) {
        // grid is rows, each row has 7 values, write them row-major to card-1..card-49
        let idx = 1;
        for (let r = 0; r < 7; r++) {
            for (let c = 0; c < 7; c++) {
                const el = document.querySelector(`#card-${idx++}`);
                if (el) el.textContent = grid[r][c];
            }
        }
    }

    // this function takes the selected column and puts it into the middle column (col 3 -> zero-based 3 is 4th column)
    // then it "gathers" by columns and redeals by rows (this is how the classic card trick works)
    function centerSelectedColumnAndRedeal(selectedColIdx1Based) {
        // convert "1..7" to 0..6
        const sel = selectedColIdx1Based - 1;

        // read current board
        const grid = readBoard(); // grid[row][col]

        // build columns as arrays top->bottom
        const columns = [];
        for (let c = 0; c < 7; c++) {
            const col = [];
            for (let r = 0; r < 7; r++) col.push(grid[r][c]);
            columns.push(col); // columns[c][r]
        }

        // i want the selected column to end up in the middle (index 3 is column #4)
        // keep the relative order of other columns, just rotate so selected ends up at position 3
        // super simple approach: make a new order where the selected col is in the middle,
        // and the others fill around it in their original order.
        // Example: if sel=0 (first), order becomes [1,2,3,0,4,5,6]
        const order = [];
        // left side we take as many as needed to fill left of center
        const leftCount = 3; // positions 0,1,2
        const rightCount = 3; // positions 4,5,6 after center

        // take the columns before the selected to fill the left (wrapping if needed)
        // but the classic trick usually just keeps natural order, so we’ll do:
        // all columns before selected, then selected in middle, then all columns after selected.
        // That puts selected in middle but shifts others naturally.
        const before = columns.slice(0, sel);
        const after  = columns.slice(sel + 1);

        // construct new columns with selected in the middle (index 3)
        // we need exactly 3 columns before and 3 after; if sel is near edges we just take from after or before as they are.
        // To keep it simple and the same result al the time(and still works for the trick), we do:
        // take the first 3 of (before + after) for left, then selected, then the rest for right (first 3).
        const rest = before.concat(after);

        const leftCols  = rest.slice(0, leftCount);
        const rightCols = rest.slice(leftCount, leftCount + rightCount);

        const newColumns = [...leftCols, columns[sel], ...rightCols];

        // NOTE: If someone wants a different style, you could also rotate so sel goes to index 3 exactly.
        // This version is fine for the trick because we always place the chosen in the middle.

        // now "gather" in this new column order (top to bottom in each column),
        // then redeal row-wise back into a 7x7 grid, ughhh only took 3 weeks to realize this!!! lol
        const gathered = [];
        for (let c = 0; c < 7; c++) {
            for (let r = 0; r < 7; r++) {
                gathered.push(newColumns[c][r]);
            }
        }

        // redeal by rows: fill 7x7 left-to-right, top-to-bottom from the gathered stack
        const newGrid = [];
        let p = 0;
        for (let r = 0; r < 7; r++) {
            const row = [];
            for (let c = 0; c < 7; c++) {
                row.push(gathered[p++]);
            }
            newGrid.push(row);
        }

        // write it back to the board
        writeBoard(newGrid);
    }

    // when a button is clicked (these say Row 1..Row 7 in your html but they actually mean Column 1..7 for the trick)
    function onPick(button) {
        // get the number from id "row-3" => 3 (we're treating it as COLUMN 3)..make sense? think about,(whoever is reading this if anyone just think)
        const colIndex = parseInt(button.id.split('-')[1], 10);

        // move that whole column to the middle and redeal
        centerSelectedColumnAndRedeal(colIndex);

        // count rounds (the classic needs 3 times)
        rounds += 1;

        // after 3 rounds, your chosen card will be dead center (row 4, col 4) = index 25 in your card ids
        if (rounds >= 3) {
            const centerCard = document.querySelector('#card-25');
            const value = centerCard ? centerCard.textContent : '';
            // reset rounds so you can play again if you want
            rounds = 0;
            // go to result page with the found number
            window.location.href = `index2.html?number=${value}`;
        }
    }

    // finally i can hook up the clicks hofreakin ray it works!!!!!!!!! 
    rowButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            onPick(this);
        });
    });
});


// document.addEventListener('DOMContentLoaded', function () {
//     const rowButtons = document.querySelectorAll('.row-buttons .row-btn');
//     const clickCounts = new Map(); // Track clicks per button

//     function logCardsInRow(button) {
//         const clicks = clickCounts.get(button) || 0;
//         clickCounts.set(button, clicks + 1);
        
//         const columnIndex = parseInt(button.id.split('-')[1]);

//         if (clickCounts.get(button) === 2) {
//             const startingCard = ((columnIndex - 1) * 7) + 1;
//             const selectedCard = document.querySelector(`#card-${startingCard}`);
//             if (selectedCard) {
//                 window.location.href = `index2.html?number=${selectedCard.textContent}`;
//                 clickCounts.set(button, 0); // Reset clicks for this button after action
//                 return;
//             }
//         }

//         // First, collect ALL current numbers from the board
//         let allNumbers = [];
//         for (let i = 1; i <= 49; i++) {
//             const card = document.querySelector(`#card-${i}`);
//             if (card) {
//                 allNumbers.push(card.textContent);
//             }
//         }

//         const selectedCards = [];
//         for (let i = columnIndex; i <= 49; i += 7) {
//             const card = document.querySelector(`#card-${i}`);
//             if (card) {
//                 selectedCards.push(card.textContent);
//             }
//         }

//         for (let pos = 0; pos < 7; pos++) {
//             const targetCard = document.querySelector(`#card-${pos + 1}`);
//             if (targetCard) {
//                 targetCard.textContent = selectedCards[pos];
//             }
//         }

//         const usedNumbers = new Set(selectedCards);
//         const remainingNumbers = allNumbers.filter(num => !usedNumbers.has(num));

//         for (let i = remainingNumbers.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1));
//             [remainingNumbers[i], remainingNumbers[j]] = [remainingNumbers[j], remainingNumbers[i]];
//         }

//         let numberIndex = 0;
//         for (let row = 1; row < 7; row++) {
//             for (let col = 0; col < 7; col++) {
//                 const cardId = (row * 7) + col + 1;
//                 const card = document.querySelector(`#card-${cardId}`);
//                 if (card && numberIndex < remainingNumbers.length) {
//                     card.textContent = remainingNumbers[numberIndex++];
//                 }
//             }
//         }
//     }
    

//     rowButtons.forEach(button => {
//         button.addEventListener('click', function() {
//             logCardsInRow(this);
//         });
//     });
// });




