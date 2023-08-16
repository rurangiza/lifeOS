NAME	=	runthis
FILE	=	markdownToHTML.cpp main.cpp

all:
	c++ -Wall -Werror -Wextra -o $(NAME) $(FILE)

run:
	./$(NAME)
clean:
	rm $(NAME)

fclean: clean

re:	clean all

.PHONY: all clean fclean re