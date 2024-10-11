import json


input_file = "dictionary\\unprocessed_dict.txt"
processed_file = "dictionary\\csw21.json"
distribution_output = "dictionary\\letter_distribution.json"

def min_length(word):
    return len(word) >= 3

# filters to apply to the words list
filters = [
    min_length
]

# % letter distribution inside the words list
def letter_distribution(words):
    letter_distribution = {}
    total_letters = 0

    # count the number of each letter in the words list
    for word in words:
        for letter in word:
            total_letters += 1
            if letter in letter_distribution:
                letter_distribution[letter] += 1
            else:
                letter_distribution[letter] = 1

    # convert the count to percentage
    for letter in letter_distribution:
        letter_distribution[letter] = letter_distribution[letter] / total_letters * 100

    return letter_distribution


def process_dictionary():
    with open(input_file, "r") as f:
        words = f.readlines()

    words = [word.strip() for word in words]

    for word in words:
        if not all(filter(word) for filter in filters):
            words.remove(word)

    letter_distribution_dict = letter_distribution(words)

    # sort the dictionary by percent
    letter_distribution_dict = dict(sorted(letter_distribution_dict.items(), key=lambda item: item[1], reverse=True))

    with open(processed_file, "w") as f:
        json.dump(words, f, indent=4)

        print("Dictionary processed and saved to", processed_file)
        print("Number of words:", len(words))
    
    with open(distribution_output, "w") as f:
        json.dump(letter_distribution_dict, f, indent=4)

        print("Letter distribution saved to", distribution_output)
        # print the letter distribution
        print("Letter distribution:")
        for letter in letter_distribution_dict:
            print(letter, ":", letter_distribution_dict[letter])
    

if __name__ == "__main__":
    process_dictionary()